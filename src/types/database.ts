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
    PostgrestVersion: "14.18"
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
      applications: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          job_id: string
          message: string | null
          status: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          job_id: string
          message?: string | null
          status?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          job_id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: number
          name: string
          name_en: string | null
          name_es: string | null
          parent_id: number | null
          section: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          name_en?: string | null
          name_es?: string | null
          parent_id?: number | null
          section?: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          name_en?: string | null
          name_es?: string | null
          parent_id?: number | null
          section?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          id: number
          lat: number | null
          lng: number | null
          name: string
          slug: string
        }
        Insert: {
          id?: number
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
        }
        Update: {
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      job_posts: {
        Row: {
          author_id: string
          availability: string | null
          bumped_at: string
          category_id: number
          city_id: number | null
          contact_method: string
          created_at: string
          custom_category: string | null
          description: string
          featured_until: string | null
          id: string
          kind: string
          languages: Json
          lat: number | null
          lng: number | null
          locality_id: number | null
          original_lang: string
          pay_agreed: boolean
          pay_pln: number | null
          pay_type: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
        }
        Insert: {
          author_id: string
          availability?: string | null
          bumped_at?: string
          category_id: number
          city_id?: number | null
          contact_method?: string
          created_at?: string
          custom_category?: string | null
          description: string
          featured_until?: string | null
          id?: string
          kind?: string
          languages?: Json
          lat?: number | null
          lng?: number | null
          locality_id?: number | null
          original_lang?: string
          pay_agreed?: boolean
          pay_pln?: number | null
          pay_type: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
        }
        Update: {
          author_id?: string
          availability?: string | null
          bumped_at?: string
          category_id?: number
          city_id?: number | null
          contact_method?: string
          created_at?: string
          custom_category?: string | null
          description?: string
          featured_until?: string | null
          id?: string
          kind?: string
          languages?: Json
          lat?: number | null
          lng?: number | null
          locality_id?: number | null
          original_lang?: string
          pay_agreed?: boolean
          pay_pln?: number | null
          pay_type?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_posts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_translations: {
        Row: {
          created_at: string
          description: string
          id: string
          job_id: string
          lang: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          job_id: string
          lang: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          job_id?: string
          lang?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_translations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          author_id: string
          created_at: string
          id: string
          job_post_id: string | null
          position: number
          rental_listing_id: string | null
          sale_listing_id: string | null
          storage_path: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          job_post_id?: string | null
          position?: number
          rental_listing_id?: string | null
          sale_listing_id?: string | null
          storage_path: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          job_post_id?: string | null
          position?: number
          rental_listing_id?: string | null
          sale_listing_id?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_rental_listing_id_fkey"
            columns: ["rental_listing_id"]
            isOneToOne: false
            referencedRelation: "rental_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_sale_listing_id_fkey"
            columns: ["sale_listing_id"]
            isOneToOne: false
            referencedRelation: "sale_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_translations: {
        Row: {
          created_at: string
          description: string
          id: string
          lang: string
          listing_id: string
          listing_table: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          lang: string
          listing_id: string
          listing_table: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          lang?: string
          listing_id?: string
          listing_table?: string
          title?: string
        }
        Relationships: []
      }
      localities: {
        Row: {
          id: number
          lat: number
          lng: number
          name: string
          name_norm: string
          population: number
          voivodeship: string | null
        }
        Insert: {
          id: number
          lat: number
          lng: number
          name: string
          name_norm: string
          population?: number
          voivodeship?: string | null
        }
        Update: {
          id?: number
          lat?: number
          lng?: number
          name?: string
          name_norm?: string
          population?: number
          voivodeship?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          job_id: string | null
          listing_id: string | null
          listing_table: string
          stripe_session_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          job_id?: string | null
          listing_id?: string | null
          listing_table?: string
          stripe_session_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          job_id?: string | null
          listing_id?: string | null
          listing_table?: string
          stripe_session_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_contacts: {
        Row: {
          phone: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          phone?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          phone?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          city_id: number | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean
          languages: string[]
          locality_id: number | null
          show_phone: boolean
        }
        Insert: {
          bio?: string | null
          city_id?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          is_verified?: boolean
          languages?: string[]
          locality_id?: number | null
          show_phone?: boolean
        }
        Update: {
          bio?: string | null
          city_id?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean
          languages?: string[]
          locality_id?: number | null
          show_phone?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_listings: {
        Row: {
          area_m2: number | null
          attributes: Json
          author_id: string
          bills_included: boolean | null
          bumped_at: string
          category_id: number
          contact_method: string
          created_at: string
          custom_category: string | null
          deposit_pln: number | null
          description: string
          featured_until: string | null
          furnished: boolean | null
          id: string
          languages: Json
          lat: number | null
          lng: number | null
          locality_id: number | null
          original_lang: string
          rent_pln: number
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rooms: number | null
          status: string
          title: string
        }
        Insert: {
          area_m2?: number | null
          attributes?: Json
          author_id: string
          bills_included?: boolean | null
          bumped_at?: string
          category_id: number
          contact_method?: string
          created_at?: string
          custom_category?: string | null
          deposit_pln?: number | null
          description: string
          featured_until?: string | null
          furnished?: boolean | null
          id?: string
          languages?: Json
          lat?: number | null
          lng?: number | null
          locality_id?: number | null
          original_lang?: string
          rent_pln: number
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rooms?: number | null
          status?: string
          title: string
        }
        Update: {
          area_m2?: number | null
          attributes?: Json
          author_id?: string
          bills_included?: boolean | null
          bumped_at?: string
          category_id?: number
          contact_method?: string
          created_at?: string
          custom_category?: string | null
          deposit_pln?: number | null
          description?: string
          featured_until?: string | null
          furnished?: boolean | null
          id?: string
          languages?: Json
          lat?: number | null
          lng?: number | null
          locality_id?: number | null
          original_lang?: string
          rent_pln?: number
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rooms?: number | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_listings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_listings_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_listings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          job_id: string | null
          reason: string
          rental_listing_id: string | null
          reporter_id: string
          sale_listing_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          job_id?: string | null
          reason: string
          rental_listing_id?: string | null
          reporter_id: string
          sale_listing_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          job_id?: string | null
          reason?: string
          rental_listing_id?: string | null
          reporter_id?: string
          sale_listing_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_rental_listing_id_fkey"
            columns: ["rental_listing_id"]
            isOneToOne: false
            referencedRelation: "rental_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_sale_listing_id_fkey"
            columns: ["sale_listing_id"]
            isOneToOne: false
            referencedRelation: "sale_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          job_id: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_listings: {
        Row: {
          attributes: Json
          author_id: string
          bumped_at: string
          category_id: number
          condition: string | null
          contact_method: string
          created_at: string
          custom_category: string | null
          description: string
          featured_until: string | null
          id: string
          languages: Json
          lat: number | null
          lng: number | null
          locality_id: number | null
          original_lang: string
          price_negotiable: boolean
          price_pln: number
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
        }
        Insert: {
          attributes?: Json
          author_id: string
          bumped_at?: string
          category_id: number
          condition?: string | null
          contact_method?: string
          created_at?: string
          custom_category?: string | null
          description: string
          featured_until?: string | null
          id?: string
          languages?: Json
          lat?: number | null
          lng?: number | null
          locality_id?: number | null
          original_lang?: string
          price_negotiable?: boolean
          price_pln: number
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
        }
        Update: {
          attributes?: Json
          author_id?: string
          bumped_at?: string
          category_id?: number
          condition?: string | null
          contact_method?: string
          created_at?: string
          custom_category?: string | null
          description?: string
          featured_until?: string | null
          id?: string
          languages?: Json
          lat?: number | null
          lng?: number | null
          locality_id?: number | null
          original_lang?: string
          price_negotiable?: boolean
          price_pln?: number
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_listings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_listings_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_listings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_requests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string
          locality_id: number | null
          pay_pln: number | null
          pay_type: string
          people_count: number
          requester_name: string
          status: string
          whatsapp: string
          when_needed: string | null
          work_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          locality_id?: number | null
          pay_pln?: number | null
          pay_type?: string
          people_count?: number
          requester_name: string
          status?: string
          whatsapp: string
          when_needed?: string | null
          work_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          locality_id?: number | null
          pay_pln?: number | null
          pay_type?: string
          people_count?: number
          requester_name?: string
          status?: string
          whatsapp?: string
          when_needed?: string | null
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_requests_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    Enums: {},
  },
} as const
