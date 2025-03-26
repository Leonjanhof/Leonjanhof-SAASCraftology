export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      licenses: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string | null
          hwid: string | null
          id: string
          last_reset_date: string | null
          license_key: string
          product_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          hwid?: string | null
          id?: string
          last_reset_date?: string | null
          license_key: string
          product_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          hwid?: string | null
          id?: string
          last_reset_date?: string | null
          license_key?: string
          product_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string
          features: string[]
          icon_name: string
          is_popular: boolean
          is_subscription: boolean
          name: string
          price: number
          price_id: string
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          features?: string[]
          icon_name?: string
          is_popular?: boolean
          is_subscription?: boolean
          name: string
          price: number
          price_id: string
          product_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          features?: string[]
          icon_name?: string
          is_popular?: boolean
          is_subscription?: boolean
          name?: string
          price?: number
          price_id?: string
          product_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          product_name: string
          rating: number
          review_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_name: string
          rating: number
          review_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_name?: string
          rating?: number
          review_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          cancel_at_period_end: boolean | null
          canceled_at: number | null
          created_at: string | null
          currency: string | null
          current_period_end: number | null
          current_period_start: number | null
          custom_field_data: Json | null
          customer_cancellation_comment: string | null
          customer_cancellation_reason: string | null
          customer_id: string | null
          ended_at: number | null
          id: string
          interval: string | null
          metadata: Json | null
          price_id: string | null
          started_at: number | null
          status: string | null
          stripe_id: string | null
          stripe_price_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: number | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: number | null
          current_period_start?: number | null
          custom_field_data?: Json | null
          customer_cancellation_comment?: string | null
          customer_cancellation_reason?: string | null
          customer_id?: string | null
          ended_at?: number | null
          id?: string
          interval?: string | null
          metadata?: Json | null
          price_id?: string | null
          started_at?: number | null
          status?: string | null
          stripe_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: number | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: number | null
          current_period_start?: number | null
          custom_field_data?: Json | null
          customer_cancellation_comment?: string | null
          customer_cancellation_reason?: string | null
          customer_id?: string | null
          ended_at?: number | null
          id?: string
          interval?: string | null
          metadata?: Json | null
          price_id?: string | null
          started_at?: number | null
          status?: string | null
          stripe_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          credits: string | null
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          subscription: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          subscription?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          subscription?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          modified_at: string | null
          stripe_event_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          modified_at?: string | null
          stripe_event_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          modified_at?: string | null
          stripe_event_id?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_missing_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_role: {
        Args: {
          user_id_param: string
          role_name_param: string
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      delete_license: {
        Args: {
          p_license_id: string
        }
        Returns: Json
      }
      delete_product: {
        Args: {
          p_product_name: string
        }
        Returns: Json
      }
      extend_license: {
        Args: {
          p_license_id: string
          p_expires_at: string
        }
        Returns: Json
      }
      generate_license: {
        Args: {
          p_user_id: string
          p_product_name: string
          p_expires_at?: string
        }
        Returns: Json
      }
      generate_license_key: {
        Args: {
          product_code: string
        }
        Returns: string
      }
      get_licenses: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search_query?: string
        }
        Returns: Json
      }
      get_user_permissions: {
        Args: {
          user_id: string
        }
        Returns: string[]
      }
      get_user_role: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      manage_user_role: {
        Args: {
          admin_user_id: string
          target_user_email: string
          new_role: string
        }
        Returns: Json
      }
      reset_license_hwid: {
        Args: {
          p_license_id: string
          p_user_id: string
        }
        Returns: Json
      }
      user_has_permission: {
        Args: {
          user_uuid: string
          required_permission: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
