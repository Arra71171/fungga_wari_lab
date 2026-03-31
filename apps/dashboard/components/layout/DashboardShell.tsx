"use client";


import { Sidebar } from "./Sidebar";
import { TeamChat } from "./TeamChat";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <TeamChat />
    </div>
  );
}
