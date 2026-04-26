"use server"

import { Resend } from "resend"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { TaskBriefEmailTemplate } from "@/components/emails/TaskBriefEmailTemplate"

const resend = new Resend(process.env.RESEND_API_KEY)

const sendTaskEmailSchema = z.object({
  taskId: z.string().uuid(),
  taskTitle: z.string().min(1).max(255),
  toEmail: z.string().email(),
  toName: z.string().min(1).max(255),
  priority: z.enum(["high", "medium", "low"]),
  message: z.string().min(1).max(2000),
})

/**
 * sendTaskEmail — dispatch a task brief via Resend to a team member.
 * Requires authentication. Sender identity is derived from their Supabase profile.
 */
export async function sendTaskEmail(args: {
  taskId: string
  taskTitle: string
  toEmail: string
  toName: string
  priority: string
  message: string
}) {
  const parsed = sendTaskEmailSchema.safeParse(args)
  if (!parsed.success) {
    throw new Error(`Validation error: ${parsed.error.message}`)
  }
  const { taskId, taskTitle, toEmail, priority, message } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  // Fetch sender profile
  const { data: senderProfile } = await supabase
    .from("users")
    .select("name, email")
    .eq("auth_id", user.id)
    .single()

  const senderName = senderProfile?.name ?? "Studio Operative"
  const senderEmail = senderProfile?.email ?? user.email ?? "noreply@fungga-wari.com"

  const taskUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000"}/dashboard/tasks`

  const { data, error } = await resend.emails.send({
    from: "Fungga Wari Lab <onboarding@resend.dev>",
    to: [toEmail],
    subject: `[Studio Brief] ${taskTitle} — ${priority.toUpperCase()} priority`,
    react: TaskBriefEmailTemplate({
      taskTitle,
      senderName,
      senderEmail,
      priority,
      message,
      taskUrl,
    }),
    headers: {
      "X-Entity-Ref-ID": taskId,
      "Idempotency-Key": `task-brief/${taskId}/${Date.now()}`,
    },
  })

  if (error) throw new Error(`Email send failed: ${error.message}`)
  return { messageId: data?.id }
}
