"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ShieldCheck, UserCheck, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

type Role = "admin" | "editor" | "viewer";

const ROLE_META: Record<Role, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  admin: { label: "Admin", icon: <ShieldCheck className="size-3" />, variant: "default" },
  editor: { label: "Editor", icon: <UserCheck className="size-3" />, variant: "secondary" },
  viewer: { label: "Viewer", icon: <Eye className="size-3" />, variant: "outline" },
};

const ROLE_CYCLE: Role[] = ["viewer", "editor", "admin"];

type TeamMember = {
  _id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  clerkId?: string;
};

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[(role as Role) ?? "viewer"] ?? ROLE_META.viewer;
  return (
    <Badge variant={meta.variant} className="flex items-center gap-1 capitalize font-mono text-[10px] tracking-widest">
      {meta.icon}
      {meta.label}
    </Badge>
  );
}

function MemberRow({ member, currentUserId, isCallerAdmin }: {
  member: TeamMember;
  currentUserId?: string;
  isCallerAdmin: boolean;
}) {
  const updateRole = useMutation(api.users.updateRole);
  const [isPending, setIsPending] = useState(false);
  const isSelf = member.clerkId === currentUserId;
  const currentRole = (member.role ?? "viewer") as Role;

  const cycleRole = async () => {
    const nextIndex = (ROLE_CYCLE.indexOf(currentRole) + 1) % ROLE_CYCLE.length;
    const nextRole = ROLE_CYCLE[nextIndex];
    setIsPending(true);
    try {
      await updateRole({ userId: member._id as never, role: nextRole });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      {/* Avatar + info */}
      <div className="flex items-center gap-4 min-w-0">
        <AvatarBadge src={member.avatarUrl} alt={member.name ?? "?"} size="default" />
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {member.name ?? "Unnamed"}
            {isSelf && (
              <span className="ml-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                (you)
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground truncate">{member.email ?? member.clerkId}</p>
        </div>
      </div>

      {/* Role badge + change button */}
      <div className="flex items-center gap-3 shrink-0">
        <RoleBadge role={currentRole} />
        {isCallerAdmin && !isSelf && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleRole}
            disabled={isPending}
            className="font-mono text-[10px] uppercase tracking-widest h-7 px-2 rounded-none"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              "Change"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const members = useQuery(api.users.getAll);
  const me = useQuery(api.users.getMe);
  const isCallerAdmin = me?.role === "admin";

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground">
          Manage roles, permissions, and workspace preferences.
        </p>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <span key={role} className="flex items-center gap-1.5">
            <Badge variant={meta.variant} className="text-[10px]">{role}</Badge>
            {role === "admin" && "— full access, can change roles"}
            {role === "editor" && "— can create & edit stories"}
            {role === "viewer" && "— read-only access"}
          </span>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Everyone who has signed into the dashboard.
            {isCallerAdmin
              ? ' Click "Change" to cycle a member\'s role: Viewer → Editor → Admin.'
              : " Only admins can change roles."}

          </CardDescription>
        </CardHeader>
        <CardContent>
          {members === undefined ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-none" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground py-4 font-mono text-sm">No team members found.</p>
          ) : (
            <div className="divide-y divide-border">
              {members.map((member) => (
                <MemberRow
                  key={member._id}
                  member={member as TeamMember}
                  currentUserId={me?.clerkId}
                  isCallerAdmin={isCallerAdmin ?? false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
