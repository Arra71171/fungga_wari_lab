export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string | null
          id: string
          public_id: string | null
          story_id: string | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["asset_type"]
          uploaded_by: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          public_id?: string | null
          story_id?: string | null
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["asset_type"]
          uploaded_by: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          public_id?: string | null
          story_id?: string | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["asset_type"]
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          id: string
          order: number
          props: Json | null
          scene_id: string | null
          story_id: string
          type: Database["public"]["Enums"]["block_type"]
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          order: number
          props?: Json | null
          scene_id?: string | null
          story_id: string
          type: Database["public"]["Enums"]["block_type"]
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          order?: number
          props?: Json | null
          scene_id?: string | null
          story_id?: string
          type?: Database["public"]["Enums"]["block_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string | null
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          audio_url: string | null
          content: string | null
          created_at: string | null
          id: string
          illustration_url: string | null
          order: number
          story_id: string
          tiptap_content: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          illustration_url?: string | null
          order: number
          story_id: string
          tiptap_content?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          illustration_url?: string | null
          order?: number
          story_id?: string
          tiptap_content?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      choices: {
        Row: {
          created_at: string | null
          id: string
          label: string
          next_scene_id: string
          scene_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          next_scene_id: string
          scene_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          next_scene_id?: string
          scene_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "choices_next_scene_id_fkey"
            columns: ["next_scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "choices_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      global_content: {
        Row: {
          id: string
          slug: string
          tiptap_content: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          tiptap_content?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          tiptap_content?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      interactions: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          duration: number | null
          id: string
          metadata: Json | null
          scene_id: string | null
          story_id: string
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          metadata?: Json | null
          scene_id?: string | null
          story_id: string
          type: Database["public"]["Enums"]["interaction_type"]
          user_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          metadata?: Json | null
          scene_id?: string | null
          story_id?: string
          type?: Database["public"]["Enums"]["interaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          scene_id: string | null
          story_id: string | null
          task_id: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          scene_id?: string | null
          story_id?: string | null
          task_id?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          scene_id?: string | null
          story_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          story_id: string
          chapter_id: string | null
          scene_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          chapter_id?: string | null
          scene_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          chapter_id?: string | null
          scene_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          }
        ]
      }
      scenes: {
        Row: {
          chapter_id: string
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          illustration_url: string | null
          is_draft: boolean | null
          order: number
          reading_time: number | null
          tiptap_content: Json | null
          title: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          chapter_id: string
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          illustration_url?: string | null
          is_draft?: boolean | null
          order: number
          reading_time?: number | null
          tiptap_content?: Json | null
          title?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          chapter_id?: string
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          illustration_url?: string | null
          is_draft?: boolean | null
          order?: number
          reading_time?: number | null
          tiptap_content?: Json | null
          title?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          attributed_author: string | null
          author_id: string
          category: Database["public"]["Enums"]["story_category"] | null
          chapter_count: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_free: boolean
          language: string
          moral: string | null
          published_at: string | null
          read_count: number | null
          reading_time: number | null
          search_vector: unknown
          searchable_text: string | null
          slug: string
          status: Database["public"]["Enums"]["story_status"]
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          attributed_author?: string | null
          author_id: string
          category?: Database["public"]["Enums"]["story_category"] | null
          chapter_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean
          language?: string
          moral?: string | null
          published_at?: string | null
          read_count?: number | null
          reading_time?: number | null
          search_vector?: unknown
          searchable_text?: string | null
          slug: string
          status?: Database["public"]["Enums"]["story_status"]
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          attributed_author?: string | null
          author_id?: string
          category?: Database["public"]["Enums"]["story_category"] | null
          chapter_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean
          language?: string
          moral?: string | null
          published_at?: string | null
          read_count?: number | null
          reading_time?: number | null
          search_vector?: unknown
          searchable_text?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["story_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          chapter_id: string | null
          created_at: string | null
          description: Json | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          scene_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          story_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          chapter_id?: string | null
          created_at?: string | null
          description?: Json | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          scene_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          story_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          chapter_id?: string | null
          created_at?: string | null
          description?: Json | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          scene_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          story_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          alias: string | null
          auth_id: string | null
          avatar_url: string | null
          bio: string | null
          clerk_id: string | null
          created_at: string | null
          custom_avatar_url: string | null
          email: string | null
          has_lifetime_access: boolean | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          alias?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          clerk_id?: string | null
          created_at?: string | null
          custom_avatar_url?: string | null
          email?: string | null
          has_lifetime_access?: boolean | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          alias?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          clerk_id?: string | null
          created_at?: string | null
          custom_avatar_url?: string | null
          email?: string | null
          has_lifetime_access?: boolean | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_chapter_count: {
        Args: { story_id: string }
        Returns: undefined
      }
      get_my_clerk_id: { Args: never; Returns: string }
      get_my_user_id: { Args: never; Returns: string }
      increment_chapter_count: {
        Args: { story_id: string }
        Returns: undefined
      }
      increment_view_count: { Args: { story_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_story_owner: { Args: { p_story_id: string }; Returns: boolean }
      matches_current_identity: { Args: { identity: string }; Returns: boolean }
    }
    Enums: {
      asset_type:
        | "illustration"
        | "sketch"
        | "reference_photo"
        | "audio_lore"
        | "cover"
        | "text_story"
      block_type:
        | "text"
        | "heading"
        | "image"
        | "dialogue"
        | "audio"
        | "choice"
        | "divider"
        | "quote"
        | "scene_break"
      interaction_type: "view" | "read" | "complete" | "drop_off"
      story_category:
        | "creation_myth"
        | "animal_fable"
        | "historical"
        | "legend"
        | "moral_tale"
        | "romance"
        | "adventure"
        | "supernatural"
        | "other"
      story_status: "draft" | "in_review" | "published"
      task_priority: "low" | "medium" | "high"
      task_status:
        | "lore_gathering"
        | "translating"
        | "illustrating"
        | "review"
        | "done"
      user_role: "admin" | "editor" | "viewer" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      asset_type: [
        "illustration",
        "sketch",
        "reference_photo",
        "audio_lore",
        "cover",
        "text_story",
      ],
      block_type: [
        "text",
        "heading",
        "image",
        "dialogue",
        "audio",
        "choice",
        "divider",
        "quote",
        "scene_break",
      ],
      interaction_type: ["view", "read", "complete", "drop_off"],
      story_category: [
        "creation_myth",
        "animal_fable",
        "historical",
        "legend",
        "moral_tale",
        "romance",
        "adventure",
        "supernatural",
        "other",
      ],
      story_status: ["draft", "in_review", "published"],
      task_priority: ["low", "medium", "high"],
      task_status: [
        "lore_gathering",
        "translating",
        "illustrating",
        "review",
        "done",
      ],
      user_role: ["admin", "editor", "viewer", "superadmin"],
    },
  },
} as const
