"use client";

import { useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

export default function SettingsPage() {
  const teamMembers = useQuery(api.teamMembers.getAll);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground">Manage roles, permissions, and workspace preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Everyone who has signed into the dashboard is considered a team member. Admins can update roles here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers === undefined ? (
             <div className="animate-pulse flex flex-col gap-4">
               {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-none" />)}
             </div>
          ) : teamMembers.length === 0 ? (
             <p className="text-muted-foreground py-4">No team members found.</p>
          ) : (
            <div className="divide-y divide-border">
              {teamMembers.map((member: any) => (
                 <div key={member._id} className="flex items-center justify-between py-4">
                   <div className="flex items-center gap-4">
                      <AvatarBadge src={member.avatarUrl} alt={member.name} size="default" />
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.userId}</p>
                      </div>
                   </div>
                   <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                     {member.role || "viewer"}
                   </Badge>
                 </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
