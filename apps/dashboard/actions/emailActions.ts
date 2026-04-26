"use server"

import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { TaskBriefEmailTemplate } from "@/components/emails/TaskBriefEmailTemplate"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const sendTaskEmailSchema = z.object({
  taskId: z.string().uuid(),
  taskTitle: z.string().min(1).max(255),
  toEmail: z.string().email(),
  toName: z.string().min(1).max(255),
  priority: z.enum(["high", "medium", "low"]),
  message: z.string().min(1).max(2000),
})

/**
 * sendTaskEmail — dispatch a task brief via Gmail SMTP to a team member.
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

  try {
    const emailHtml = await render(
      TaskBriefEmailTemplate({
        taskTitle,
        senderName,
        senderEmail,
        priority,
        message,
        taskUrl,
      })
    )

    const info = await transporter.sendMail({
      from: `"Fungga Wari Lab" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `[Studio Brief] ${taskTitle} — ${priority.toUpperCase()} priority`,
      html: emailHtml,
      headers: {
        "X-Entity-Ref-ID": taskId,
        "Idempotency-Key": `task-brief/${taskId}/${Date.now()}`,
      },
    })

    return { messageId: info.messageId }
  } catch (error: any) {
    throw new Error(`Email send failed: ${error.message || "Unknown SMTP error"}`)
  }
}
