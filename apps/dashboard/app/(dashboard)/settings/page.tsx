"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import type { Json } from "@workspace/ui/types/supabase";
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge";
import { Button } from "@workspace/ui/components/button";
import { ShieldCheck, UserCheck, Eye, Loader2, Settings2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

const RichTextEditor = dynamic(
  () => import("@workspace/ui/components/editor/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full border-2 border-border-strong bg-cinematic-bg text-muted-foreground font-mono text-xs flex items-center justify-center min-h-[400px]">
        Loading Global Content Editor...
      </div>
    ),
  }
);
import type { JSONContent } from "@tiptap/core";
import { OperativeDossier } from "@/components/settings/OperativeDossier";
import { getAllUsers, updateUserRole, deleteUserAccount } from "@/actions/userActions";
import { getGlobalContent, upsertGlobalContent } from "@/actions/assetActions";

type Role = "superadmin" | "admin" | "editor" | "viewer";
type Member = Awaited<ReturnType<typeof getAllUsers>>[number];

// ─── Role Meta ────────────────────────────────────────────────────────────────

const ROLE_META: Record<Role, { label: string; icon: React.ReactNode }> = {
  superadmin: { label: "Superadmin", icon: <ShieldCheck className="size-3" /> },
  admin: { label: "Admin", icon: <ShieldCheck className="size-3 opacity-80" /> },
  editor: { label: "Editor", icon: <UserCheck className="size-3" /> },
  viewer: { label: "Viewer", icon: <Eye className="size-3" /> },
};

const ROLE_CYCLE: Role[] = ["viewer", "editor", "admin", "superadmin"];

// ─── RoleBadge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[(role as Role) ?? "viewer"] ?? ROLE_META.viewer;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-1.5 border-2 text-fine font-mono tracking-widest uppercase shadow-brutal-sm whitespace-nowrap",
        role === "superadmin" && "border-brand-ember text-brand-ember bg-brand-ember/5",
        role === "admin" && "border-primary text-primary bg-primary/5",
        role === "editor" && "border-brand-ochre text-brand-ochre bg-brand-ochre/5",
        role !== "superadmin" && role !== "admin" && role !== "editor" && "border-border-strong text-muted-foreground/80 bg-bg-surface/50"
      )}
    >
      {meta.icon}
      {meta.label}
    </div>
  );
}

// ─── MemberRow ────────────────────────────────────────────────────────────────

function MemberRow({
  member,
  currentUserAuthId,
  isCallerAdmin,
  isCallerSuperAdmin,
}: {
  member: Member;
  currentUserAuthId?: string;
  isCallerAdmin: boolean;
  isCallerSuperAdmin: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isSelf = member.auth_id === currentUserAuthId;
  const currentRole = (member.role ?? "viewer") as Role;

  const cycleRole = async () => {
    if (!member.id) return;
    const allowedCycle = isCallerSuperAdmin ? ROLE_CYCLE : ROLE_CYCLE.filter(r => r !== "superadmin");
    const currentIndex = allowedCycle.indexOf(currentRole);
    // If somehow current role isn't in allowed cycle (e.g. target is superadmin but caller is admin), do nothing
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % allowedCycle.length;
    const nextRole = allowedCycle[nextIndex]!;
    setIsPending(true);
    try {
      await updateUserRole(String(member.id), nextRole);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!member.id) return;
    if (!window.confirm(`Are you sure you want to permanently delete operative ${member.email ?? member.id}? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteUserAccount(String(member.id));
      window.location.reload(); // Quick refresh to update the roster
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete user");
      console.error(e);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between p-4 md:p-6 gap-4 border-b-2 border-border-strong bg-cinematic-panel transition-all group hover:bg-bg-surface/5">
      <div className="flex items-start md:items-center gap-4 md:gap-6 min-w-0 flex-col sm:flex-row">
        <div className="border-2 border-border p-1 bg-cinematic-bg group-hover:border-primary transition-colors shrink-0">
          <AvatarBadge
            src={member.avatar_url ?? undefined}
            alt={member.alias || member.name || "?"}
            size="default"
            className="rounded-none"
          />
        </div>
        <div className="min-w-0 w-full">
          <p className="font-heading text-xl text-foreground font-bold tracking-tight truncate flex flex-wrap items-center gap-2">
            <span className="truncate">{member.alias || member.name || member.email?.split("@")[0] || "Unnamed Operative"}</span>
            {isSelf && (
              <span className="px-2 py-0.5 text-nano font-mono font-bold text-brand-ember uppercase tracking-label border border-brand-ember/30 bg-brand-ember/5 whitespace-nowrap shrink-0">
                Active Uplink
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5">
            {member.alias && member.name && (
              <span className="text-fine font-mono tracking-widest text-muted-foreground/50 truncate border-r-2 border-border-strong pr-3">
                {member.name}
              </span>
            )}
            <span className="text-fine font-mono tracking-widest text-muted-foreground truncate">
              {member.email ?? member.auth_id}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 xl:gap-8 shrink-0 mt-2 xl:mt-0 w-full xl:w-auto">
        <div className="w-auto xl:min-w-[140px] flex justify-start text-center">
          <RoleBadge role={currentRole} />
        </div>
        {isCallerAdmin && !isSelf && (
          <div className="flex items-center gap-2 ml-auto xl:ml-0 flex-1 xl:flex-none justify-end">
            {(isCallerSuperAdmin || currentRole !== "superadmin") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleRole}
              disabled={isPending || isDeleting}
              className="font-mono text-fine font-bold uppercase tracking-label h-10 px-4 sm:px-6 border-2 border-border rounded-none bg-cinematic-bg hover:border-primary hover:bg-cinematic-bg text-muted-foreground transition-all shadow-none hover:shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none flex-1 sm:flex-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isPending ? <Loader2 className="size-4 animate-spin text-primary" /> : "Cycle Clearance"}
            </Button>
            )}
            {(isCallerSuperAdmin || currentRole !== "superadmin") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isPending || isDeleting}
                className="h-10 w-10 border-2 border-border rounded-none bg-cinematic-bg hover:border-destructive hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-none hover:shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Delete Operative"
                aria-label="Delete Operative"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin text-destructive" /> : <Trash2 className="size-4" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GlobalContentSection ─────────────────────────────────────────────────────

function GlobalContentSection({ isCallerAdmin }: { isCallerAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<"manifesto" | "terms">("manifesto");
  // contentData is no longer needed since we use isLoading for skeleton state
  const [editorContent, setEditorContent] = useState<JSONContent | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    getGlobalContent(activeTab).then((data) => {
      if (data?.tiptap_content !== undefined && data?.tiptap_content !== null) {
        setEditorContent(data.tiptap_content as JSONContent);
      } else {
        setEditorContent({ type: "doc", content: [{ type: "paragraph" }] });
      }
    }).catch(console.error).finally(() => {
      setIsLoading(false);
    });
  }, [activeTab]);

  const handleSave = async () => {
    if (!editorContent || !isCallerAdmin) return;
    setIsSaving(true);
    try {
      await upsertGlobalContent({
        slug: activeTab,
        title: activeTab === "manifesto" ? "Fungga Wari Manifesto" : "Terms of Hearth",
        tiptap_content: editorContent as Json,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BrutalistCard variant="panel" padding="none" className="bg-cinematic-bg overflow-hidden mt-12 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="p-4 md:p-6 border-b-2 border-border flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 bg-bg-surface/10">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-foreground/90">
            Global Configurations
          </h2>
          <p className="text-fine font-mono text-muted-foreground uppercase tracking-widest mt-1 border-l-2 border-border/50 pl-2">
            {isCallerAdmin
              ? "Modify the central lore and protocols globally."
              : "Insufficient clearance to alter global content. View-only mode active."}
          </p>
        </div>
        <div className="flex flex-wrap border-2 border-border-strong p-1 gap-1 bg-cinematic-panel">
          {(["manifesto", "terms"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "font-mono text-fine font-bold uppercase tracking-label rounded-none h-10 px-6 transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground border-2 border-primary"
                  : "text-muted-foreground hover:bg-bg-overlay border-2 border-transparent"
              )}
            >
              {tab === "manifesto" ? "Manifesto" : "Terms"}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="animate-pulse h-[400px] border-2 border-border-strong bg-bg-surface/20 blur-sm" />
        ) : (
          <div className="space-y-4">
            {!isCallerAdmin && (
              <div className="p-4 border-2 border-brand-ember/50 bg-brand-ember/5 text-brand-ember font-mono text-fine font-bold uppercase tracking-caps">
                View-Only Clearance. Unauthorized modifications denied.
              </div>
            )}
            <RichTextEditor
              key={activeTab}
              value={editorContent}
              onChange={setEditorContent}
              className="min-h-[400px] border-2 border-border-strong bg-cinematic-bg"
              editable={isCallerAdmin}
            />
            {isCallerAdmin && (
              <div className="flex flex-col sm:flex-row justify-end pt-4 items-end sm:items-center gap-4 border-t-2 border-border-strong mt-6 pt-6">
                {saveSuccess && (
                  <span className="font-mono text-fine font-bold text-primary uppercase tracking-label text-right">
                    Protocol Overwritten Successfully
                  </span>
                )}
                <Button
                  id="global-content-deploy-btn"
                  onClick={handleSave}
                  disabled={isSaving || !editorContent}
                  className="font-mono text-xs font-bold uppercase tracking-label rounded-none w-full sm:w-auto min-w-[160px] h-12 border-2 border-primary bg-primary text-primary-foreground hover:bg-cinematic-bg hover:text-primary transition-all shadow-brutal active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  {isSaving ? <Loader2 className="animate-spin size-4" /> : "Deploy Changes"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </BrutalistCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, userProfile } = useSupabaseAuth();
  const [members, setMembers] = useState<Member[] | undefined>(undefined);

  const myRole = userProfile?.role ?? "editor";
  const isCallerAdmin = myRole === "superadmin" || myRole === "admin";
  const isCallerSuperAdmin = myRole === "superadmin";

  useEffect(() => {
    getAllUsers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, []);

  return (
    <div className="flex flex-col min-h-full p-6 lg:p-10 lg:px-14 max-w-[1400px] mx-auto w-full space-y-16 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col border-b-4 border-foreground pb-8 shrink-0 relative z-10 w-full pt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-primary font-mono text-fine font-bold uppercase tracking-caps mb-2 border-l-4 border-primary pl-3 bg-primary/5 w-fit py-1 pr-4">
            <Settings2 className="size-4" />
            <span>Core Mainframe</span>
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-foreground leading-[0.8]">
            System Configuration.
          </h1>
          <p className="text-muted-foreground font-mono text-fine font-bold tracking-label uppercase max-w-2xl mt-4">
            Global access controls, network roles, and identity dossier protocols for authorized operatives.
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Operative Dossier */}
        <OperativeDossier />

        {/* Roster Sector */}
        <BrutalistCard variant="panel" padding="none" className="bg-cinematic-panel overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-6 border-b-2 border-border flex justify-between items-end bg-bg-surface/10">
            <div>
              <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-foreground/90">
                Operative Roster
              </h2>
              <p className="text-fine font-mono text-muted-foreground uppercase tracking-widest mt-1 border-l-2 border-border/50 pl-2">
                {isCallerAdmin
                  ? "Admin Access: Cycle classifications to upgrade privileges."
                  : "Insufficient clearance to alter roles. View-only matrix active."}
              </p>
            </div>
          </div>

          <div>
            {members === undefined ? (
              <div className="animate-pulse flex flex-col p-4 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 border-2 border-border bg-cinematic-bg" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground font-mono text-sm font-bold uppercase tracking-caps">
                NO SIGNALS DETECTED.
              </div>
            ) : (
              <div className="flex flex-col">
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    currentUserAuthId={user?.id}
                    isCallerAdmin={isCallerAdmin}
                    isCallerSuperAdmin={isCallerSuperAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        </BrutalistCard>

        {/* Role Legend */}
        <BrutalistCard variant="panel" className="bg-cinematic-bg mt-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="size-2 bg-primary" />
            <h3 className="font-mono text-xs font-bold tracking-label uppercase text-foreground">
              Role Classification Matrix
            </h3>
            <div className="flex-1 h-[2px] bg-border-strong" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.keys(ROLE_META).map((role) => (
              <div key={role} className="flex flex-col gap-3 p-4 border-2 border-border">
                <div className="w-fit">
                  <RoleBadge role={role} />
                </div>
                <p className="text-fine font-mono text-muted-foreground tracking-widest leading-relaxed uppercase">
                  {role === "superadmin" && "Root access level. Complete matrix control over configuration and roles."}
                  {role === "admin" && "Administrative access. Can manage the operative roster and edit global configurations."}
                  {role === "editor" && "Authoring access. Ability to overwrite literature and sequence flows."}
                  {role === "viewer" && "Observer level. Access granted strictly for reading and verifying."}
                </p>
              </div>
            ))}
          </div>
        </BrutalistCard>

        {/* Global Content */}
        <GlobalContentSection isCallerAdmin={isCallerAdmin} />
      </div>
    </div>
  );
}
