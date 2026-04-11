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
          confirmation_email_sent: boolean
          confirmation_email_sent_at: string | null
          created_at: string
          end_time: string
          followup_email_sent: boolean
          followup_email_sent_at: string | null
          google_event_id: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_paid_at: string | null
          payment_session_id: string | null
          payment_status: string | null
          price: number | null
          reminder_email_sent: boolean
          reminder_email_sent_at: string | null
          salon_id: string
          service_id: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          confirmation_email_sent?: boolean
          confirmation_email_sent_at?: string | null
          created_at?: string
          end_time: string
          followup_email_sent?: boolean
          followup_email_sent_at?: string | null
          google_event_id?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_paid_at?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          price?: number | null
          reminder_email_sent?: boolean
          reminder_email_sent_at?: string | null
          salon_id: string
          service_id: string
          staff_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          confirmation_email_sent?: boolean
          confirmation_email_sent_at?: string | null
          created_at?: string
          end_time?: string
          followup_email_sent?: boolean
          followup_email_sent_at?: string | null
          google_event_id?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_paid_at?: string | null
          payment_session_id?: string | null
          payment_status?: string | null
          price?: number | null
          reminder_email_sent?: boolean
          reminder_email_sent_at?: string | null
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
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_mappings: {
        Row: {
          audience_id: string | null
          audience_name: string
          created_at: string | null
          id: string
          is_exclusion: boolean | null
          salon_id: string
          tag_name: string
        }
        Insert: {
          audience_id?: string | null
          audience_name: string
          created_at?: string | null
          id?: string
          is_exclusion?: boolean | null
          salon_id: string
          tag_name: string
        }
        Update: {
          audience_id?: string | null
          audience_name?: string
          created_at?: string | null
          id?: string
          is_exclusion?: boolean | null
          salon_id?: string
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_mappings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_actions: {
        Row: {
          ai_explanation: string
          client_id: string | null
          created_at: string | null
          cta_action: string | null
          cta_label: string | null
          executed_at: string | null
          id: string
          metadata: Json | null
          salon_id: string
          scheduled_at: string
          status: string
          triggered_by: string
          type: string
        }
        Insert: {
          ai_explanation: string
          client_id?: string | null
          created_at?: string | null
          cta_action?: string | null
          cta_label?: string | null
          executed_at?: string | null
          id?: string
          metadata?: Json | null
          salon_id: string
          scheduled_at?: string
          status?: string
          triggered_by: string
          type: string
        }
        Update: {
          ai_explanation?: string
          client_id?: string | null
          created_at?: string | null
          cta_action?: string | null
          cta_label?: string | null
          executed_at?: string | null
          id?: string
          metadata?: Json | null
          salon_id?: string
          scheduled_at?: string
          status?: string
          triggered_by?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_actions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopilot_actions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_config: {
        Row: {
          ai_suggestions_enabled: boolean | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_messages_per_client_days: number | null
          noshow_followup_minutes: number | null
          paused_until: string | null
          pixel_sync_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_hours_before: number[] | null
          retention_trigger_days: number[] | null
          review_request_delay_hours: number | null
          salon_id: string
          updated_at: string | null
          weekly_brief_day: string | null
          weekly_brief_hour: number | null
        }
        Insert: {
          ai_suggestions_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_messages_per_client_days?: number | null
          noshow_followup_minutes?: number | null
          paused_until?: string | null
          pixel_sync_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_hours_before?: number[] | null
          retention_trigger_days?: number[] | null
          review_request_delay_hours?: number | null
          salon_id: string
          updated_at?: string | null
          weekly_brief_day?: string | null
          weekly_brief_hour?: number | null
        }
        Update: {
          ai_suggestions_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_messages_per_client_days?: number | null
          noshow_followup_minutes?: number | null
          paused_until?: string | null
          pixel_sync_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_hours_before?: number[] | null
          retention_trigger_days?: number[] | null
          review_request_delay_hours?: number | null
          salon_id?: string
          updated_at?: string | null
          weekly_brief_day?: string | null
          weekly_brief_hour?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_config_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_stats: {
        Row: {
          actions_taken: number | null
          clients_reactivated: number | null
          created_at: string | null
          id: string
          revenue_recovered: number | null
          reviews_collected: number | null
          salon_id: string
          week_start: string
        }
        Insert: {
          actions_taken?: number | null
          clients_reactivated?: number | null
          created_at?: string | null
          id?: string
          revenue_recovered?: number | null
          reviews_collected?: number | null
          salon_id: string
          week_start: string
        }
        Update: {
          actions_taken?: number | null
          clients_reactivated?: number | null
          created_at?: string | null
          id?: string
          revenue_recovered?: number | null
          reviews_collected?: number | null
          salon_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_stats_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_products_db: {
        Row: {
          avg_wholesale_price: number | null
          brand: string | null
          capacity: string | null
          category: string | null
          created_at: string | null
          ean: string
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          avg_wholesale_price?: number | null
          brand?: string | null
          capacity?: string | null
          category?: string | null
          created_at?: string | null
          ean: string
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          avg_wholesale_price?: number | null
          brand?: string | null
          capacity?: string | null
          category?: string | null
          created_at?: string | null
          ean?: string
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      client_communication_preferences: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          opted_out: boolean | null
          opted_out_at: string | null
          preferred_channel: string | null
          preferred_day: number | null
          preferred_hour: number | null
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          opted_out?: boolean | null
          opted_out_at?: string | null
          preferred_channel?: string | null
          preferred_day?: number | null
          preferred_hour?: number | null
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          opted_out?: boolean | null
          opted_out_at?: string | null
          preferred_channel?: string | null
          preferred_day?: number | null
          preferred_hour?: number | null
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_communication_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_communication_preferences_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      client_coupons: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          salon_id: string
          title: string
          used_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          salon_id: string
          title: string
          used_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          salon_id?: string
          title?: string
          used_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_coupons_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          salon_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          salon_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          salon_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notifications_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_public: boolean
          rating: number
          salon_id: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          rating: number
          salon_id: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          rating?: number
          salon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reviews_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      client_risk_scores: {
        Row: {
          calculated_at: string
          client_id: string
          created_at: string
          factors: Json | null
          id: string
          recommendations: Json | null
          risk_level: string
          risk_score: number
          salon_id: string
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          client_id: string
          created_at?: string
          factors?: Json | null
          id?: string
          recommendations?: Json | null
          risk_level?: string
          risk_score?: number
          salon_id: string
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          client_id?: string
          created_at?: string
          factors?: Json | null
          id?: string
          recommendations?: Json | null
          risk_level?: string
          risk_score?: number
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_risk_scores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_risk_scores_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      client_salon_links: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          is_favorite: boolean
          joined_at: string
          salon_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          is_favorite?: boolean
          joined_at?: string
          salon_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          is_favorite?: boolean
          joined_at?: string
          salon_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_salon_links_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          is_system: boolean
          name: string
          salon_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          salon_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          salon_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tags_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
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
          last_visit_at: string | null
          marketing_consent: boolean | null
          notes: string | null
          phone: string
          purchase_categories: string[] | null
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
          last_visit_at?: string | null
          marketing_consent?: boolean | null
          notes?: string | null
          phone: string
          purchase_categories?: string[] | null
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
          last_visit_at?: string | null
          marketing_consent?: boolean | null
          notes?: string | null
          phone?: string
          purchase_categories?: string[] | null
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
      consultation_cards: {
        Row: {
          client_id: string
          created_at: string | null
          filled_at: string | null
          id: string
          red_flags: string[] | null
          responses: Json
          salon_id: string
          signature_url: string | null
          status: string | null
          template_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          filled_at?: string | null
          id?: string
          red_flags?: string[] | null
          responses?: Json
          salon_id: string
          signature_url?: string | null
          status?: string | null
          template_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          filled_at?: string | null
          id?: string
          red_flags?: string[] | null
          responses?: Json
          salon_id?: string
          signature_url?: string | null
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_cards_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_cards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "consultation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_sends: {
        Row: {
          appointment_id: string | null
          card_id: string | null
          client_id: string | null
          completed_at: string | null
          expires_at: string | null
          id: string
          salon_id: string
          send_method: string | null
          sent_at: string | null
          status: string | null
          unique_token: string | null
        }
        Insert: {
          appointment_id?: string | null
          card_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          expires_at?: string | null
          id?: string
          salon_id: string
          send_method?: string | null
          sent_at?: string | null
          status?: string | null
          unique_token?: string | null
        }
        Update: {
          appointment_id?: string | null
          card_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          expires_at?: string | null
          id?: string
          salon_id?: string
          send_method?: string | null
          sent_at?: string | null
          status?: string | null
          unique_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_sends_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_sends_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "consultation_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_sends_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_sends_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_templates: {
        Row: {
          category: string | null
          created_at: string | null
          estimated_minutes: number | null
          fields: Json
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          estimated_minutes?: number | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          estimated_minutes?: number | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_templates_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          created_at: string
          id: string
          processed_at: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          client_id: string | null
          created_at: string
          event_type: string
          id: string
          link_url: string | null
          message_id: string
          metadata: Json | null
          salon_id: string
          sequence_name: string | null
          tracked_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          link_url?: string | null
          message_id: string
          metadata?: Json | null
          salon_id: string
          sequence_name?: string | null
          tracked_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          link_url?: string | null
          message_id?: string
          metadata?: Json | null
          salon_id?: string
          sequence_name?: string | null
          tracked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tracking_events_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_queue: {
        Row: {
          channel: string
          client_id: string
          created_at: string
          error_message: string | null
          id: string
          rule_id: string | null
          salon_id: string
          scheduled_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          client_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          rule_id?: string | null
          salon_id: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          client_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          rule_id?: string | null
          salon_id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_queue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_queue_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "followup_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_queue_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_rules: {
        Row: {
          category_id: string | null
          created_at: string
          days_since_last_visit: number
          email_template_id: string | null
          id: string
          is_active: boolean
          name: string
          salon_id: string
          updated_at: string
          whatsapp_template_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          days_since_last_visit?: number
          email_template_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          salon_id: string
          updated_at?: string
          whatsapp_template_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          days_since_last_visit?: number
          email_template_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          salon_id?: string
          updated_at?: string
          whatsapp_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followup_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_rules_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "followup_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_rules_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_rules_whatsapp_template_id_fkey"
            columns: ["whatsapp_template_id"]
            isOneToOne: false
            referencedRelation: "followup_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          salon_id: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          salon_id: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          salon_id?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_templates_salon_id_fkey"
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
      loyalty_stamps: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string
          id: string
          points: number
          reason: string
          salon_id: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          points?: number
          reason?: string
          salon_id: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          points?: number
          reason?: string
          salon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_stamps_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_stamps_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_stamps_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_attributions: {
        Row: {
          ad_campaign: string | null
          appointment_id: string | null
          audience_name: string | null
          client_id: string
          created_at: string | null
          id: string
          revenue: number | null
          salon_id: string
        }
        Insert: {
          ad_campaign?: string | null
          appointment_id?: string | null
          audience_name?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          revenue?: number | null
          salon_id: string
        }
        Update: {
          ad_campaign?: string | null
          appointment_id?: string | null
          audience_name?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          revenue?: number | null
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pixel_attributions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixel_attributions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixel_attributions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_config: {
        Row: {
          access_token_encrypted: string | null
          ad_account_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          pixel_id: string | null
          salon_id: string
          sync_interval_hours: number | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          ad_account_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          pixel_id?: string | null
          salon_id: string
          sync_interval_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          ad_account_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          pixel_id?: string | null
          salon_id?: string
          sync_interval_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_config_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_events: {
        Row: {
          client_id: string | null
          event_name: string
          event_value: number | null
          hashed_email: string | null
          hashed_phone: string | null
          id: string
          salon_id: string
          sent_at: string | null
          source_type: string | null
        }
        Insert: {
          client_id?: string | null
          event_name: string
          event_value?: number | null
          hashed_email?: string | null
          hashed_phone?: string | null
          id?: string
          salon_id: string
          sent_at?: string | null
          source_type?: string | null
        }
        Update: {
          client_id?: string | null
          event_name?: string
          event_value?: number | null
          hashed_email?: string | null
          hashed_phone?: string | null
          id?: string
          salon_id?: string
          sent_at?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixel_events_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_sync_log: {
        Row: {
          audiences_updated: number | null
          completed_at: string | null
          errors: Json | null
          events_sent: number | null
          id: string
          salon_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          audiences_updated?: number | null
          completed_at?: string | null
          errors?: Json | null
          events_sent?: number | null
          id?: string
          salon_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          audiences_updated?: number | null
          completed_at?: string | null
          errors?: Json | null
          events_sent?: number | null
          id?: string
          salon_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_sync_log_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          salon_id: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          salon_id: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          salon_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
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
          product_category_id: string | null
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
          product_category_id?: string | null
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
          product_category_id?: string | null
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
            foreignKeyName: "products_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
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
          dark_mode: boolean
          email: string
          first_name: string | null
          id: string
          is_approved: boolean
          last_name: string | null
          notifications_email: boolean
          notifications_push: boolean
          notifications_sms: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          dark_mode?: boolean
          email: string
          first_name?: string | null
          id: string
          is_approved?: boolean
          last_name?: string | null
          notifications_email?: boolean
          notifications_push?: boolean
          notifications_sms?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          dark_mode?: boolean
          email?: string
          first_name?: string | null
          id?: string
          is_approved?: boolean
          last_name?: string | null
          notifications_email?: boolean
          notifications_push?: boolean
          notifications_sms?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity_delivered: number | null
          quantity_ordered: number
          total_net: number | null
          unit_price_net: number | null
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity_delivered?: number | null
          quantity_ordered?: number
          total_net?: number | null
          unit_price_net?: number | null
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity_delivered?: number | null
          quantity_ordered?: number
          total_net?: number | null
          unit_price_net?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          order_number: string | null
          ordered_at: string | null
          salon_id: string
          status: string | null
          supplier_id: string | null
          total_gross: number | null
          total_net: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          ordered_at?: string | null
          salon_id: string
          status?: string | null
          supplier_id?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          ordered_at?: string | null
          salon_id?: string
          status?: string | null
          supplier_id?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          device_token: string
          id: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_token: string
          id?: string
          platform?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_token?: string
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          activated_at: string | null
          clicks: number | null
          client_id: string
          code: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          new_client_reward_value: number | null
          referee_reward_description: string | null
          referee_reward_type: string | null
          referee_reward_value: number | null
          referral_url: string | null
          reward_description: string | null
          reward_type: string | null
          reward_value: number | null
          salon_id: string
          total_referrals: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          clicks?: number | null
          client_id: string
          code: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          new_client_reward_value?: number | null
          referee_reward_description?: string | null
          referee_reward_type?: string | null
          referee_reward_value?: number | null
          referral_url?: string | null
          reward_description?: string | null
          reward_type?: string | null
          reward_value?: number | null
          salon_id: string
          total_referrals?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          clicks?: number | null
          client_id?: string
          code?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          new_client_reward_value?: number | null
          referee_reward_description?: string | null
          referee_reward_type?: string | null
          referee_reward_value?: number | null
          referral_url?: string | null
          reward_description?: string | null
          reward_type?: string | null
          reward_value?: number | null
          salon_id?: string
          total_referrals?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_codes_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_config: {
        Row: {
          auto_activate_after_visits: number | null
          auto_send_review_request: boolean | null
          created_at: string | null
          facebook_review_url: string | null
          google_review_url: string | null
          id: string
          program_active: boolean | null
          referee_reward_description: string | null
          referee_reward_type: string | null
          referee_reward_value: number | null
          referrer_reward_description: string | null
          referrer_reward_type: string | null
          referrer_reward_value: number | null
          review_send_channel: string | null
          review_send_delay_hours: number | null
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          auto_activate_after_visits?: number | null
          auto_send_review_request?: boolean | null
          created_at?: string | null
          facebook_review_url?: string | null
          google_review_url?: string | null
          id?: string
          program_active?: boolean | null
          referee_reward_description?: string | null
          referee_reward_type?: string | null
          referee_reward_value?: number | null
          referrer_reward_description?: string | null
          referrer_reward_type?: string | null
          referrer_reward_value?: number | null
          review_send_channel?: string | null
          review_send_delay_hours?: number | null
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          auto_activate_after_visits?: number | null
          auto_send_review_request?: boolean | null
          created_at?: string | null
          facebook_review_url?: string | null
          google_review_url?: string | null
          id?: string
          program_active?: boolean | null
          referee_reward_description?: string | null
          referee_reward_type?: string | null
          referee_reward_value?: number | null
          referrer_reward_description?: string | null
          referrer_reward_type?: string | null
          referrer_reward_value?: number | null
          review_send_channel?: string | null
          review_send_delay_hours?: number | null
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_config_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          event_type: string
          id: string
          referral_code_id: string
          referred_client_id: string | null
          referrer_client_id: string
          revenue: number | null
          reward_amount: number | null
          reward_given: boolean | null
          salon_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          referral_code_id: string
          referred_client_id?: string | null
          referrer_client_id: string
          revenue?: number | null
          reward_amount?: number | null
          reward_given?: boolean | null
          salon_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          referral_code_id?: string
          referred_client_id?: string | null
          referrer_client_id?: string
          revenue?: number | null
          reward_amount?: number | null
          reward_given?: boolean | null
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referred_client_id_fkey"
            columns: ["referred_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referrer_client_id_fkey"
            columns: ["referrer_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_conversions: {
        Row: {
          appointment_id: string | null
          client_id: string
          created_at: string | null
          id: string
          message_id: string | null
          revenue_recovered: number | null
          salon_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          revenue_recovered?: number | null
          salon_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          revenue_recovered?: number | null
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retention_conversions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_conversions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_conversions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "retention_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_conversions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_messages: {
        Row: {
          bounced_at: string | null
          channel: string
          clicked_at: string | null
          client_id: string
          created_at: string | null
          delivered_at: string | null
          id: string
          message_content: string | null
          metadata: Json | null
          opened_at: string | null
          preview_text: string | null
          salon_id: string
          sequence_id: string | null
          status: string | null
          subject: string | null
          tracking_token: string | null
        }
        Insert: {
          bounced_at?: string | null
          channel?: string
          clicked_at?: string | null
          client_id: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message_content?: string | null
          metadata?: Json | null
          opened_at?: string | null
          preview_text?: string | null
          salon_id: string
          sequence_id?: string | null
          status?: string | null
          subject?: string | null
          tracking_token?: string | null
        }
        Update: {
          bounced_at?: string | null
          channel?: string
          clicked_at?: string | null
          client_id?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message_content?: string | null
          metadata?: Json | null
          opened_at?: string | null
          preview_text?: string | null
          salon_id?: string
          sequence_id?: string | null
          status?: string | null
          subject?: string | null
          tracking_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_messages_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_messages_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "retention_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_sequences: {
        Row: {
          countdown_hours: number | null
          created_at: string | null
          id: string
          incentive_details: Json | null
          include_incentive: boolean | null
          is_active: boolean | null
          message_template: string
          salon_id: string
          sequence_key: string
          tone: string | null
          trigger_days: number
          updated_at: string | null
        }
        Insert: {
          countdown_hours?: number | null
          created_at?: string | null
          id?: string
          incentive_details?: Json | null
          include_incentive?: boolean | null
          is_active?: boolean | null
          message_template: string
          salon_id: string
          sequence_key: string
          tone?: string | null
          trigger_days: number
          updated_at?: string | null
        }
        Update: {
          countdown_hours?: number | null
          created_at?: string | null
          id?: string
          incentive_details?: Json | null
          include_incentive?: boolean | null
          is_active?: boolean | null
          message_template?: string
          salon_id?: string
          sequence_key?: string
          tone?: string | null
          trigger_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_sequences_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_tracking: {
        Row: {
          event_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          link_url: string | null
          message_id: string | null
          user_agent: string | null
        }
        Insert: {
          event_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          message_id?: string | null
          user_agent?: string | null
        }
        Update: {
          event_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          message_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_tracking_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "retention_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      review_outcomes: {
        Row: {
          client_id: string
          created_at: string | null
          detected_at: string | null
          id: string
          platform: string | null
          rating: number | null
          review_request_id: string | null
          review_text: string | null
          reward_sent: boolean | null
          reward_type: string | null
          reward_value: number | null
          salon_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          detected_at?: string | null
          id?: string
          platform?: string | null
          rating?: number | null
          review_request_id?: string | null
          review_text?: string | null
          reward_sent?: boolean | null
          reward_type?: string | null
          reward_value?: number | null
          salon_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          detected_at?: string | null
          id?: string
          platform?: string | null
          rating?: number | null
          review_request_id?: string | null
          review_text?: string | null
          reward_sent?: boolean | null
          reward_type?: string | null
          reward_value?: number | null
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_outcomes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_outcomes_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_outcomes_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          appointment_id: string | null
          channel: string | null
          clicked_at: string | null
          client_id: string
          created_at: string | null
          id: string
          message_number: number | null
          nps_score: number | null
          opened_at: string | null
          platform: string | null
          review_stars: number | null
          review_url: string | null
          salon_id: string
          send_channel: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          tracking_token: string | null
        }
        Insert: {
          appointment_id?: string | null
          channel?: string | null
          clicked_at?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          message_number?: number | null
          nps_score?: number | null
          opened_at?: string | null
          platform?: string | null
          review_stars?: number | null
          review_url?: string | null
          salon_id: string
          send_channel?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          tracking_token?: string | null
        }
        Update: {
          appointment_id?: string | null
          channel?: string | null
          clicked_at?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          message_number?: number | null
          nps_score?: number | null
          opened_at?: string | null
          platform?: string | null
          review_stars?: number | null
          review_url?: string | null
          salon_id?: string
          send_channel?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          tracking_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_gallery: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          salon_id: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          salon_id: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_gallery_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          address: string | null
          city: string | null
          client_sources: Json | null
          communication_email: string | null
          communication_email_verified: boolean | null
          communication_phone: string | null
          communication_phone_verified: boolean | null
          communication_provider: Json | null
          communication_setup_completed: boolean | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          onboarding_completed: boolean
          onboarding_step: number
          owner_id: string | null
          phone: string | null
          reschedule_notice_hours: number
          salon_type: string | null
          settings: Json | null
          slug: string
          social_url: string | null
          team_size: number | null
          theme_primary_color: string | null
          theme_secondary_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_sources?: Json | null
          communication_email?: string | null
          communication_email_verified?: boolean | null
          communication_phone?: string | null
          communication_phone_verified?: boolean | null
          communication_provider?: Json | null
          communication_setup_completed?: boolean | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean
          onboarding_step?: number
          owner_id?: string | null
          phone?: string | null
          reschedule_notice_hours?: number
          salon_type?: string | null
          settings?: Json | null
          slug: string
          social_url?: string | null
          team_size?: number | null
          theme_primary_color?: string | null
          theme_secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          client_sources?: Json | null
          communication_email?: string | null
          communication_email_verified?: boolean | null
          communication_phone?: string | null
          communication_phone_verified?: boolean | null
          communication_provider?: Json | null
          communication_setup_completed?: boolean | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          owner_id?: string | null
          phone?: string | null
          reschedule_notice_hours?: number
          salon_type?: string | null
          settings?: Json | null
          slug?: string
          social_url?: string | null
          team_size?: number | null
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
      service_consultation_cards: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          send_hours_before: number | null
          send_timing: string | null
          service_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          send_hours_before?: number | null
          send_timing?: string | null
          service_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          send_hours_before?: number | null
          send_timing?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_consultation_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "consultation_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_consultation_cards_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_product_recipes: {
        Row: {
          created_at: string | null
          id: string
          is_optional: boolean | null
          mix_ratio: number | null
          notes: string | null
          product_id: string
          quantity_unit: string | null
          quantity_used: number
          quantity_value: number | null
          salon_id: string
          service_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          mix_ratio?: number | null
          notes?: string | null
          product_id: string
          quantity_unit?: string | null
          quantity_used?: number
          quantity_value?: number | null
          salon_id: string
          service_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          mix_ratio?: number | null
          notes?: string | null
          product_id?: string
          quantity_unit?: string | null
          quantity_used?: number
          quantity_value?: number | null
          salon_id?: string
          service_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_product_recipes_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_product_recipes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_variants: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          service_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          service_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          service_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_variants_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          benefits: Json
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
          benefits?: Json
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
          benefits?: Json
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
          base_salary: number | null
          bio: string | null
          break_duration: number | null
          break_start: string | null
          certifications: string[] | null
          color: string | null
          commission_rate: number | null
          compensation_type: string | null
          contract_type: string | null
          created_at: string
          email: string | null
          flat_rate_per_service: number | null
          hourly_rate: number | null
          id: string
          invitation_email: string | null
          invitation_sent_at: string | null
          invitation_status: string | null
          is_active: boolean
          name: string
          permissions: Json | null
          phone: string | null
          role: string | null
          salary_bonus_rate: number | null
          salary_bonus_threshold: number | null
          salon_id: string
          specializations: Json | null
          staff_role: string | null
          started_at: string | null
          updated_at: string
          user_id: string | null
          visible_in_widget: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          base_salary?: number | null
          bio?: string | null
          break_duration?: number | null
          break_start?: string | null
          certifications?: string[] | null
          color?: string | null
          commission_rate?: number | null
          compensation_type?: string | null
          contract_type?: string | null
          created_at?: string
          email?: string | null
          flat_rate_per_service?: number | null
          hourly_rate?: number | null
          id?: string
          invitation_email?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          is_active?: boolean
          name: string
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          salary_bonus_rate?: number | null
          salary_bonus_threshold?: number | null
          salon_id: string
          specializations?: Json | null
          staff_role?: string | null
          started_at?: string | null
          updated_at?: string
          user_id?: string | null
          visible_in_widget?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          base_salary?: number | null
          bio?: string | null
          break_duration?: number | null
          break_start?: string | null
          certifications?: string[] | null
          color?: string | null
          commission_rate?: number | null
          compensation_type?: string | null
          contract_type?: string | null
          created_at?: string
          email?: string | null
          flat_rate_per_service?: number | null
          hourly_rate?: number | null
          id?: string
          invitation_email?: string | null
          invitation_sent_at?: string | null
          invitation_status?: string | null
          is_active?: boolean
          name?: string
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          salary_bonus_rate?: number | null
          salary_bonus_threshold?: number | null
          salon_id?: string
          specializations?: Json | null
          staff_role?: string | null
          started_at?: string | null
          updated_at?: string
          user_id?: string | null
          visible_in_widget?: boolean | null
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
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
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
            foreignKeyName: "stock_movements_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
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
          {
            foreignKeyName: "time_off_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
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
          {
            foreignKeyName: "transactions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          salon_id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          salon_id: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          salon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referral_codes_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          completed_at: string | null
          id: string
          referral_code_id: string
          referred_at: string
          referred_user_id: string
          referrer_user_id: string
          reward_points: number
          salon_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          referral_code_id: string
          referred_at?: string
          referred_user_id: string
          referrer_user_id: string
          reward_points?: number
          salon_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          referral_code_id?: string
          referred_at?: string
          referred_user_id?: string
          referrer_user_id?: string
          reward_points?: number
          salon_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "user_referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
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
      voice_notes: {
        Row: {
          ai_extracted: Json | null
          appointment_id: string | null
          audio_url: string
          client_id: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          salon_id: string
          staff_id: string | null
          transcript: string | null
        }
        Insert: {
          ai_extracted?: Json | null
          appointment_id?: string | null
          audio_url: string
          client_id: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          salon_id: string
          staff_id?: string | null
          transcript?: string | null
        }
        Update: {
          ai_extracted?: Json | null
          appointment_id?: string | null
          audio_url?: string
          client_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          salon_id?: string
          staff_id?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_briefs: {
        Row: {
          ai_narrative: string | null
          ai_top_action: Json | null
          ai_warning: Json | null
          appointments_change_pct: number | null
          appointments_count: number | null
          autopilot_actions: Json | null
          created_at: string | null
          email_sent_at: string | null
          id: string
          noshow_count: number | null
          noshow_pct: number | null
          occupancy_pct: number | null
          push_sent_at: string | null
          revenue: number | null
          revenue_change_pct: number | null
          salon_id: string
          sms_sent_at: string | null
          week_start: string
        }
        Insert: {
          ai_narrative?: string | null
          ai_top_action?: Json | null
          ai_warning?: Json | null
          appointments_change_pct?: number | null
          appointments_count?: number | null
          autopilot_actions?: Json | null
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          noshow_count?: number | null
          noshow_pct?: number | null
          occupancy_pct?: number | null
          push_sent_at?: string | null
          revenue?: number | null
          revenue_change_pct?: number | null
          salon_id: string
          sms_sent_at?: string | null
          week_start: string
        }
        Update: {
          ai_narrative?: string | null
          ai_top_action?: Json | null
          ai_warning?: Json | null
          appointments_change_pct?: number | null
          appointments_count?: number | null
          autopilot_actions?: Json | null
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          noshow_count?: number | null
          noshow_pct?: number | null
          occupancy_pct?: number | null
          push_sent_at?: string | null
          revenue?: number | null
          revenue_change_pct?: number | null
          salon_id?: string
          sms_sent_at?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_briefs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "working_hours_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      staff_google_calendar_safe: {
        Row: {
          block_from_google: boolean | null
          calendar_id: string | null
          created_at: string | null
          google_email: string | null
          is_active: boolean | null
          staff_id: string | null
          sync_to_google: boolean | null
          updated_at: string | null
        }
        Insert: {
          block_from_google?: boolean | null
          calendar_id?: string | null
          created_at?: string | null
          google_email?: string | null
          is_active?: boolean | null
          staff_id?: string | null
          sync_to_google?: boolean | null
          updated_at?: string | null
        }
        Update: {
          block_from_google?: boolean | null
          calendar_id?: string | null
          created_at?: string | null
          google_email?: string | null
          is_active?: boolean | null
          staff_id?: string | null
          sync_to_google?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_public_view: {
        Row: {
          avatar_url: string | null
          bio: string | null
          color: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          role: string | null
          salon_id: string | null
          specializations: Json | null
          visible_in_widget: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          color?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          salon_id?: string | null
          specializations?: Json | null
          visible_in_widget?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          color?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          role?: string | null
          salon_id?: string | null
          specializations?: Json | null
          visible_in_widget?: boolean | null
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
      seed_default_client_tags: {
        Args: { _salon_id: string }
        Returns: undefined
      }
      seed_default_product_categories: {
        Args: { p_salon_id: string }
        Returns: undefined
      }
      user_belongs_to_salon: {
        Args: { _salon_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "salon_owner" | "staff" | "client"
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
      app_role: ["super_admin", "salon_owner", "staff", "client"],
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
