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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string | null
          created_at: string
          end_time: string
          google_event_id: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          price: number | null
          salon_id: string
          service_id: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          end_time: string
          google_event_id?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          price?: number | null
          salon_id: string
          service_id: string
          staff_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          end_time?: string
          google_event_id?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          price?: number | null
          salon_id?: string
          service_id?: string
          staff_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_problematic: boolean | null
          is_vip: boolean | null
          last_name: string
          marketing_consent: boolean | null
          notes: string | null
          phone: string
          rodo_consent: boolean
          salon_id: string
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_problematic?: boolean | null
          is_vip?: boolean | null
          last_name: string
          marketing_consent?: boolean | null
          notes?: string | null
          phone: string
          rodo_consent?: boolean
          salon_id: string
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_problematic?: boolean | null
          is_vip?: boolean | null
          last_name?: string
          marketing_consent?: boolean | null
          notes?: string | null
          phone?: string
          rodo_consent?: boolean
          salon_id?: string
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          city: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          rodo_consent: boolean
          salon_name: string
          status: string
          team_size: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          rodo_consent?: boolean
          salon_name: string
          status?: string
          team_size: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          rodo_consent?: boolean
          salon_name?: string
          status?: string
          team_size?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          current_stock: number
          description: string | null
          ean: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_for_internal_use: boolean
          min_stock: number
          name: string
          purchase_price_net: number | null
          sale_price_gross: number
          salon_id: string
          sku: string | null
          supplier_id: string | null
          updated_at: string
          variant: string | null
          vat_rate: number
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          current_stock?: number
          description?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_for_internal_use?: boolean
          min_stock?: number
          name: string
          purchase_price_net?: number | null
          sale_price_gross?: number
          salon_id: string
          sku?: string | null
          supplier_id?: string | null
          updated_at?: string
          variant?: string | null
          vat_rate?: number
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          current_stock?: number
          description?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_for_internal_use?: boolean
          min_stock?: number
          name?: string
          purchase_price_net?: number | null
          sale_price_gross?: number
          salon_id?: string
          sku?: string | null
          supplier_id?: string | null
          updated_at?: string
          variant?: string | null
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_approved: boolean
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_approved?: boolean
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_approved?: boolean
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      salons: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          settings: Json | null
          slug: string
          theme_primary_color: string | null
          theme_secondary_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug: string
          theme_primary_color?: string | null
          theme_secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug?: string
          theme_primary_color?: string | null
          theme_secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          salon_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          salon_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          salon_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration: number
          id: string
          is_active: boolean
          media: Json | null
          name: string
          price: number
          salon_id: string
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          media?: Json | null
          name: string
          price?: number
          salon_id: string
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          media?: Json | null
          name?: string
          price?: number
          salon_id?: string
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_google_calendar: {
        Row: {
          access_token: string | null
          block_from_google: boolean | null
          calendar_id: string
          created_at: string | null
          google_email: string
          id: string
          is_active: boolean | null
          refresh_token: string | null
          staff_id: string
          sync_to_google: boolean | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          block_from_google?: boolean | null
          calendar_id?: string
          created_at?: string | null
          google_email: string
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          staff_id: string
          sync_to_google?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          block_from_google?: boolean | null
          calendar_id?: string
          created_at?: string | null
          google_email?: string
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          staff_id?: string
          sync_to_google?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          avatar_url: string | null
          color: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          role: string | null
          salon_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          role?: string | null
          salon_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          role?: string | null
          salon_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          created_at: string
          id: string
          service_id: string
          staff_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          staff_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          invoice_number: string | null
          note: string | null
          product_id: string
          quantity: number
          salon_id: string
          staff_id: string | null
          supplier_id: string | null
          total_value: number | null
          transaction_id: string | null
          type: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          invoice_number?: string | null
          note?: string | null
          product_id: string
          quantity: number
          salon_id: string
          staff_id?: string | null
          supplier_id?: string | null
          total_value?: number | null
          transaction_id?: string | null
          type: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          invoice_number?: string | null
          note?: string | null
          product_id?: string
          quantity?: number
          salon_id?: string
          staff_id?: string | null
          supplier_id?: string | null
          total_value?: number | null
          transaction_id?: string | null
          type?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          discount_info: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          salon_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          discount_info?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          salon_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          discount_info?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          created_at: string
          end_date: string
          id: string
          note: string | null
          staff_id: string
          start_date: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          note?: string | null
          staff_id: string
          start_date: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          note?: string | null
          staff_id?: string
          start_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          category: string | null
          client_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          payment_method: string
          product_id: string | null
          quantity: number | null
          salon_id: string
          staff_id: string | null
          tip_amount: number | null
          transaction_date: string
          type: string
          unit_price: number | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          category?: string | null
          client_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string
          product_id?: string | null
          quantity?: number | null
          salon_id: string
          staff_id?: string | null
          tip_amount?: number | null
          transaction_date?: string
          type: string
          unit_price?: number | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          category?: string | null
          client_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string
          product_id?: string | null
          quantity?: number | null
          salon_id?: string
          staff_id?: string | null
          tip_amount?: number | null
          transaction_date?: string
          type?: string
          unit_price?: number | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
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
          role: Database["public"]["Enums"]["app_role"]
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
      working_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_working: boolean
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_working?: boolean
          staff_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_working?: boolean
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_salon_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_salon: {
        Args: { _salon_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "salon_owner" | "staff"
      appointment_status:
        | "booked"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
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
      app_role: ["super_admin", "salon_owner", "staff"],
      appointment_status: [
        "booked",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
    },
  },
} as const
