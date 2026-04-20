"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@workspace/ui/types/supabase"

type TaskStatus = Database["public"]["Enums"]["task_status"]
type TaskPriority = Database["public"]["Enums"]["task_priority"]

// ─── Task Queries ─────────────────────────────────────────────────────────────

/**
 * getAllTasks — all tasks for the dashboard board view.
 */
export async function getAllTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee_id, due_date, story_id, chapter_id, scene_id, created_at, updated_at")
    .order("created_at", { ascending: false })

  return data ?? []
}

/**
 * getTasksByStatus — filter tasks by pipeline status.
 */
export async function getTasksByStatus(status: TaskStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee_id, due_date, story_id, created_at, updated_at")
    .eq("status", status)
    .order("updated_at", { ascending: false })

  return data ?? []
}

/**
 * getTasksByStoryId — tasks scoped to a specific story.
 */
export async function getTasksByStoryId(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee_id, due_date, story_id, created_at, updated_at")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false })

  return data ?? []
}

/**
 * getMyTasks — tasks assigned to the current user.
 */
export async function getMyTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const userId = user.id

  const { data } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, story_id, created_at, updated_at")
    .eq("assignee_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })

  return data ?? []
}

// ─── Task Mutations ───────────────────────────────────────────────────────────

/**
 * createTask — create a new production task.
 */
export async function createTask(args: {
  title: string
  description?: Record<string, unknown>
  assigneeId?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  storyId?: string
  chapterId?: string
  sceneId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: args.title,
      description: (args.description ?? null) as never,
      assignee_id: args.assigneeId ?? null,
      status: args.status ?? "lore_gathering",
      priority: args.priority ?? "medium",
      due_date: args.dueDate ?? null,
      story_id: args.storyId ?? null,
      chapter_id: args.chapterId ?? null,
      scene_id: args.sceneId ?? null,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create task: ${error.message}`)
  return data.id
}

/**
 * updateTaskStatus — move task through the Kanban pipeline.
 */
export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase.from("tasks").update({ status }).eq("id", id)
  if (error) throw new Error(`Failed to update task status: ${error.message}`)
  return id
}

/**
 * updateTask — patch task metadata.
 */
export async function updateTask(
  id: string,
  patch: {
    title?: string
    priority?: TaskPriority
    assignee_id?: string | null
    due_date?: string | null
    story_id?: string | null
    description?: Record<string, unknown>
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase
    .from("tasks")
    .update(patch as never)
    .eq("id", id)

  if (error) throw new Error(`Failed to update task: ${error.message}`)
  return id
}

/**
 * deleteTask — delete a task.
 */
export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete task: ${error.message}`)
  return { success: true }
}

/**
 * getTaskStats — dashboard overview counts by status.
 */
export async function getTaskStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("tasks")
    .select("status")

  if (!data) return null

  const counts: Record<TaskStatus, number> = {
    lore_gathering: 0,
    translating: 0,
    illustrating: 0,
    review: 0,
    done: 0,
  }

  for (const task of data) {
    counts[task.status]++
  }

  return counts
}
