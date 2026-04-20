"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2, Fingerprint, Activity, BookOpen, CheckCircle2, ShieldCheck, ScanFace } from "lucide-react";
import { getMyProfile, updateUserProfile, getOperativeStats } from "@/actions/userActions";

type Profile = Awaited<ReturnType<typeof getMyProfile>>;

export function OperativeDossier() {
  const { userProfile } = useSupabaseAuth();
  const [me, setMe] = useState<Profile | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [alias, setAlias] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<{ missionsCompleted: number; loreAuthored: number } | null>(null);

  useEffect(() => {
    getMyProfile().then((profile) => {
      setMe(profile);
      if (profile) {
        setAlias(profile.alias ?? "");
        setBio(profile.bio ?? "");
        if (profile.auth_id) {
          getOperativeStats(profile.auth_id).then(setStats).catch(console.error);
        }
      }
    });
  }, []);

  if (me === undefined) {
    return (
      <div className="animate-pulse h-[300px] bg-bg-surface/20 border-2 border-border-strong rounded-none shadow-brutal-sm" />
    );
  }

  // Authoritative display name: alias > DB name > email
  const displayName =
    me?.alias || me?.name || userProfile?.name || me?.email || "Unnamed Operative";
  const role = me?.role ?? "viewer";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ alias, bio });
      setSaveSuccess(true);
      // Refresh local state
      const updated = await getMyProfile();
      setMe(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Missing Cloudinary configuration");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const response = await fetch(uploadUrl, { method: "POST", body: formData });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to upload image");
      }

      const uploadResponse = await response.json();
      await updateUserProfile({ avatar_url: uploadResponse.secure_url });
      const updated = await getMyProfile();
      setMe(updated);
    } catch (error) {
      console.error("Failed to upload avatar", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Priority: custom DB avatar_url > default
  const currentAvatar = me?.avatar_url;

  return (
    <div className="border-2 border-border-strong bg-cinematic-panel relative overflow-hidden shadow-brutal transition-all">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Header */}
      <div className="p-6 border-b-2 border-border flex justify-between items-center bg-bg-surface/10">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-foreground/90">
            Operative Dossier
          </h2>
          <p className="text-fine font-mono text-primary tracking-label uppercase mt-1">
            Identity &amp; Authorization Protocol
          </p>
        </div>
        <Fingerprint className="text-primary size-8 opacity-50" />
      </div>

      <div className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Left Column: Avatar + Identity Summary + Stats */}
        <div className="md:col-span-4 flex flex-col items-center space-y-6">

          {/* Avatar Upload Zone */}
          <div
            className="relative group cursor-pointer w-40 h-40 flex items-center justify-center p-1 bg-cinematic-bg border-2 border-border hover:border-primary transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-full h-full relative overflow-hidden">
              <AvatarBadge src={currentAvatar ?? undefined} alt={displayName} className="w-full h-full rounded-none" />

              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                {isUploading ? (
                  <Loader2 className="animate-spin size-8 text-primary" />
                ) : (
                  <>
                    <ScanFace className="size-8 text-primary" />
                    <span className="font-mono text-fine font-bold uppercase tracking-caps text-primary">
                      Rescan
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* HUD corners */}
            <div className="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-primary transition-all group-hover:-top-2 group-hover:-left-2" />
            <div className="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-primary transition-all group-hover:-top-2 group-hover:-right-2" />
            <div className="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-primary transition-all group-hover:-bottom-2 group-hover:-left-2" />
            <div className="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-primary transition-all group-hover:-bottom-2 group-hover:-right-2" />

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Identity Summary */}
          <div className="w-full text-center space-y-1">
            <p className="font-display italic text-2xl text-foreground break-words">{displayName}</p>
            <p className="font-mono text-fine text-muted-foreground tracking-widest truncate">
              {me?.email ?? userProfile?.email}
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 border-2 text-fine font-mono tracking-widest uppercase shadow-brutal-sm ${
                role === "superadmin"
                  ? "border-brand-ember text-brand-ember bg-brand-ember/5"
                  : role === "editor"
                  ? "border-brand-ochre text-brand-ochre bg-brand-ochre/5"
                  : "border-border-strong text-muted-foreground/80 bg-bg-surface/50"
              }`}
            >
              {role === "superadmin" && <ShieldCheck className="size-3" />}
              {role} Level
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="w-full border-2 border-border-strong bg-cinematic-bg p-4 space-y-3">
            <h3 className="font-mono text-fine font-bold uppercase tracking-label text-muted-foreground border-b-2 border-border-strong pb-2">
              Metrics
            </h3>
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="size-3 text-brand-ember" />
                  <span className="uppercase tracking-widest text-fine">Missions</span>
                </div>
                <span className="text-brand-ember font-bold">{stats?.missionsCompleted ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2 text-foreground">
                  <BookOpen className="size-3 text-brand-ochre" />
                  <span className="uppercase tracking-widest text-fine">Fragments</span>
                </div>
                <span className="text-brand-ochre font-bold">{stats?.loreAuthored ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Fields */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Alias */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="size-1.5 bg-primary shrink-0" />
                Codename / Alias
              </label>
              <Input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="ENTER OPERATIVE ALIAS..."
                className="h-12 border-2 border-border bg-cinematic-bg font-mono text-sm tracking-wide text-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-primary/5 rounded-none transition-colors shadow-none"
              />
              <p className="font-mono text-fine text-muted-foreground uppercase tracking-wider pl-4 border-l-2 border-border-strong">
                Overrides display name globally.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="size-1.5 bg-primary shrink-0" />
                Field Bio
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="ENTER FIELD BIO OR RECORD..."
                className="min-h-[160px] resize-none border-2 border-border bg-cinematic-bg font-mono leading-relaxed tracking-wide text-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-primary/5 rounded-none transition-colors shadow-none p-4"
              />
            </div>
          </div>

          {/* Save Controls */}
          <div className="flex justify-between items-center pt-6 border-t-2 border-border-strong">
            {saveSuccess ? (
              <span className="font-mono text-fine font-bold text-primary uppercase tracking-label flex items-center gap-2">
                <CheckCircle2 className="size-4" /> Sync Established.
              </span>
            ) : (
              <span className="font-mono text-nano text-muted-foreground uppercase tracking-widest">
                Data persists immediately upon sync
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || (alias === (me?.alias ?? "") && bio === (me?.bio ?? ""))}
              className="h-12 px-6 font-mono text-xs font-bold uppercase tracking-label rounded-none border-2 border-primary bg-primary text-primary-foreground hover:bg-cinematic-bg hover:text-primary transition-all shadow-brutal active:translate-y-1 active:translate-x-1 active:shadow-none min-w-[200px]"
            >
              {isSaving ? <Loader2 className="animate-spin size-4 mr-2" /> : <Activity className="size-4 mr-2" />}
              {isSaving ? "Syncing..." : "Sync Identity"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
