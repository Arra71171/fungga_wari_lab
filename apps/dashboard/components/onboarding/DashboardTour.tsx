"use client";

import React from "react";
import { useEffect } from "react";
import { type Tour, useNextStep } from "nextstepjs";
import {
  BookOpen,
  Eye,
  BookCheck,
  BarChart2,
  FileText,
  Send,
  Globe2,
  Image,
  ListTodo,
  Settings2,
  Globe,
  UserCircle,
  Sun,
} from "lucide-react";

// ─── Rich Content Components ──────────────────────────────────────────────────
// These are React nodes passed as `content` to each step.
// They use only semantic Tailwind tokens from the design system.

function WelcomeContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        You&apos;re now inside <span className="text-foreground font-semibold">Fungga Wari Creator Studio</span> — your command center for building and managing the Fungga Wari oral literature archive.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: BarChart2, label: "Analytics Dashboard", desc: "KPIs, charts & pipeline" },
          { icon: BookOpen, label: "Manuscripts", desc: "Write, edit & publish" },
          { icon: Image, label: "Asset Library", desc: "Media via Cloudinary" },
          { icon: Settings2, label: "Settings", desc: "Profile & preferences" },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-start gap-2 border border-border-subtle bg-bg-surface/50 p-3"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-brand-ember" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
                {label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/70">
        This tour takes ~30 seconds. You can skip anytime.
      </p>
    </div>
  );
}

function OverviewContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The <span className="text-foreground font-semibold">Overview page</span> is your analytics hub. Everything about your archive&apos;s health lives here.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 border-l-2 border-brand-ember pl-3">
          <Eye className="size-4 shrink-0 text-brand-ochre" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">KPI Cards</p>
            <p className="text-[11px] text-muted-foreground">Total Manuscripts · Total Views · Total Reads · Completion Rate</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-brand-ochre pl-3">
          <div className="flex shrink-0 items-center gap-1">
            <FileText className="size-3.5 text-muted-foreground" />
            <Send className="size-3.5 text-brand-ochre" />
            <Globe2 className="size-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">Publishing Pipeline</p>
            <p className="text-[11px] text-muted-foreground">Drafts → In Review → Published. Track every story&apos;s progress.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-border-strong pl-3">
          <BookCheck className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Engagement Charts</p>
            <p className="text-[11px] text-muted-foreground">Completion rate donuts, category distribution, recent activity feed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentToolsContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Everything you need to create and manage archive content in three dedicated sections.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3 border border-border-subtle bg-bg-surface/30 p-3">
          <BookOpen className="mt-0.5 size-4 shrink-0 text-brand-ember" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Manuscripts</p>
            <p className="text-[11px] text-muted-foreground">Create and edit stories with the block-based editor. Set status (Draft → In Review → Published), add cover art, manage chapters and scenes.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 border border-border-subtle bg-bg-surface/30 p-3">
          <ListTodo className="mt-0.5 size-4 shrink-0 text-brand-ochre" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Tasks</p>
            <p className="text-[11px] text-muted-foreground">Manage translation, transcription, and editorial review tasks. Drag-and-drop Kanban board keeps the workflow moving.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 border border-border-subtle bg-bg-surface/30 p-3">
          <Image className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Assets</p>
            <p className="text-[11px] text-muted-foreground">Upload illustrations, audio, and media. All assets are optimized and served via Cloudinary CDN.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettingsContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your profile block and quick actions are always one click away at the bottom of the sidebar.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 border-l-2 border-brand-ember pl-3">
          <UserCircle className="size-4 shrink-0 text-brand-ember" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Your Profile</p>
            <p className="text-[11px] text-muted-foreground">Displays your name and role. Head to Settings to update your avatar and preferences.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-brand-ochre pl-3">
          <Sun className="size-4 shrink-0 text-brand-ochre" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">Theme Toggle</p>
            <p className="text-[11px] text-muted-foreground">Switch between light and dark mode instantly — your preference is saved.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-border-strong pl-3">
          <Globe className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-[11px] font-semibold text-foreground">View Stories (Public Site)</p>
            <p className="text-[11px] text-muted-foreground">Opens the immersive reader — see the archive exactly as your audience does.</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-brand-ember font-mono tracking-wide">
        You&apos;re all set. Start building the archive. 🔥
      </p>
    </div>
  );
}

// ─── Tour Steps ───────────────────────────────────────────────────────────────

export const dashboardTourSteps: Tour[] = [
  {
    tour: "dashboardTour",
    steps: [
      {
        // No selector = nextstepjs renders centered in the viewport (no cut-off)
        icon: "🔥",
        title: "Welcome to Creator Studio",
        content: <WelcomeContent />,
        selector: undefined,
        showControls: true,
        showSkip: true,
      },
      {
        icon: "📊",
        title: "Your Analytics Hub",
        content: <OverviewContent />,
        selector: "#tour-overview-stats",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "✍️",
        title: "Content & Tools",
        content: <ContentToolsContent />,
        selector: "#tour-manuscripts",
        side: "right",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "👤",
        title: "Profile & Settings",
        content: <ProfileSettingsContent />,
        selector: "#tour-profile",
        side: "top",
        showControls: true,
        showSkip: true,
      },
    ],
  },
];

// ─── Trigger ─────────────────────────────────────────────────────────────────

export function DashboardOnboardingTrigger() {
  const { startNextStep } = useNextStep();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenDashboardTour");
    if (!hasSeenTour) {
      // Small delay to let the layout fully paint before spotlight activates
      const timer = setTimeout(() => {
        startNextStep("dashboardTour");
        localStorage.setItem("hasSeenDashboardTour", "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [startNextStep]);

  return null;
}
