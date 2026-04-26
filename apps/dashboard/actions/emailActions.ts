"use server"

import React from "react"
import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { TaskBriefEmailTemplate } from "@/components/emails/TaskBriefEmailTemplate"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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
 * Email dispatch is best-effort; callers should catch and handle failures gracefully.
 */
export async function sendTaskEmail(args: z.infer<typeof sendTaskEmailSchema>) {
  const parsed = sendTaskEmailSchema.safeParse(args)
  if (!parsed.success) {
    throw new Error(`Validation error: ${parsed.error.message}`)
  }
  const { taskId, taskTitle, toEmail, toName, priority, message } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  // Fetch sender profile — log errors but don't block sending
  const { data: senderProfile, error: profileError } = await supabase
    .from("users")
    .select("name, email")
    .eq("auth_id", user.id)
    .single()

  if (profileError) {
    console.warn("[sendTaskEmail] Could not fetch sender profile:", profileError.message)
  }

  const senderName = senderProfile?.name ?? "Studio Operative"
  const senderEmail = senderProfile?.email ?? user.email ?? "noreply@fungga-wari.com"

  // Build a canonical task URL — omit the CTA entirely if env var is not set
  const baseUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL
  const taskUrl = baseUrl ? `${baseUrl}/dashboard/tasks/${taskId}` : undefined

  try {
    const emailHtml = await render(
      React.createElement(TaskBriefEmailTemplate, {
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
      to: `"${toName}" <${toEmail}>`,
      subject: `[Studio Brief] ${taskTitle} — ${priority.toUpperCase()} priority`,
      html: emailHtml,
      headers: {
        "X-Entity-Ref-ID": taskId,
        // Deterministic key: same task + same recipient always produces the same key
        "Idempotency-Key": `task-brief/${taskId}/${toEmail}`,
      },
    })

    return { messageId: info.messageId }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown SMTP error"
    throw new Error(`Email send failed: ${message}`, { cause: error })
  }
}
