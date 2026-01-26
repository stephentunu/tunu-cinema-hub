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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      downloads: {
        Row: {
          downloaded_at: string
          episode_id: string | null
          id: string
          movie_id: string | null
          quality: string
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          episode_id?: string | null
          id?: string
          movie_id?: string | null
          quality: string
          user_id: string
        }
        Update: {
          downloaded_at?: string
          episode_id?: string | null
          id?: string
          movie_id?: string | null
          quality?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downloads_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          air_date: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          episode_number: number
          id: string
          season_number: number
          series_id: string
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          air_date?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          episode_number: number
          id?: string
          season_number: number
          series_id: string
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          air_date?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          episode_number?: number
          id?: string
          season_number?: number
          series_id?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      movie_genres: {
        Row: {
          genre_id: string
          id: string
          movie_id: string
        }
        Insert: {
          genre_id: string
          id?: string
          movie_id: string
        }
        Update: {
          genre_id?: string
          id?: string
          movie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          backdrop_url: string | null
          cast_members: string[] | null
          country: string | null
          created_at: string
          description: string | null
          director: string | null
          download_count: number | null
          duration_minutes: number | null
          id: string
          is_featured: boolean | null
          language: string | null
          poster_url: string | null
          rating: number | null
          rating_count: number | null
          release_year: number | null
          slug: string
          status: string | null
          tagline: string | null
          title: string
          trailer_url: string | null
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          backdrop_url?: string | null
          cast_members?: string[] | null
          country?: string | null
          created_at?: string
          description?: string | null
          director?: string | null
          download_count?: number | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          rating_count?: number | null
          release_year?: number | null
          slug: string
          status?: string | null
          tagline?: string | null
          title: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          backdrop_url?: string | null
          cast_members?: string[] | null
          country?: string | null
          created_at?: string
          description?: string | null
          director?: string | null
          download_count?: number | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          rating_count?: number | null
          release_year?: number | null
          slug?: string
          status?: string | null
          tagline?: string | null
          title?: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          movie_id: string | null
          rating: number
          series_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id?: string | null
          rating: number
          series_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: string | null
          rating?: number
          series_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          likes_count: number | null
          movie_id: string | null
          series_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          likes_count?: number | null
          movie_id?: string | null
          series_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          likes_count?: number | null
          movie_id?: string | null
          series_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          backdrop_url: string | null
          cast_members: string[] | null
          country: string | null
          created_at: string
          creator: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          language: string | null
          poster_url: string | null
          rating: number | null
          rating_count: number | null
          release_year: number | null
          slug: string
          status: string | null
          tagline: string | null
          title: string
          total_seasons: number | null
          trailer_url: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          backdrop_url?: string | null
          cast_members?: string[] | null
          country?: string | null
          created_at?: string
          creator?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          rating_count?: number | null
          release_year?: number | null
          slug: string
          status?: string | null
          tagline?: string | null
          title: string
          total_seasons?: number | null
          trailer_url?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          backdrop_url?: string | null
          cast_members?: string[] | null
          country?: string | null
          created_at?: string
          creator?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          rating_count?: number | null
          release_year?: number | null
          slug?: string
          status?: string | null
          tagline?: string | null
          title?: string
          total_seasons?: number | null
          trailer_url?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      series_genres: {
        Row: {
          genre_id: string
          id: string
          series_id: string
        }
        Insert: {
          genre_id: string
          id?: string
          series_id: string
        }
        Update: {
          genre_id?: string
          id?: string
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_genres_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          completed: boolean | null
          episode_id: string | null
          id: string
          last_watched_at: string
          movie_id: string | null
          progress_seconds: number | null
          total_seconds: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          episode_id?: string | null
          id?: string
          last_watched_at?: string
          movie_id?: string | null
          progress_seconds?: number | null
          total_seconds?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          episode_id?: string | null
          id?: string
          last_watched_at?: string
          movie_id?: string | null
          progress_seconds?: number | null
          total_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_history_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          movie_id: string | null
          series_id: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          movie_id?: string | null
          series_id?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          movie_id?: string | null
          series_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
