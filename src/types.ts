export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_minutes: number
          price?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price?: number
          is_active?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          service_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          service_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          service_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          weekday: number // 0-6, 0=Sunday
          is_open: boolean
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          weekday: number
          is_open?: boolean
          start_time?: string
          end_time?: string
        }
        Update: {
          id?: string
          weekday?: number
          is_open?: boolean
          start_time?: string
          end_time?: string
        }
      }
      blocked_dates: {
        Row: {
          id: string
          blocked_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          blocked_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          blocked_date?: string
          reason?: string | null
          created_at?: string
        }
      }
      clinic_settings: {
        Row: {
          id: string
          clinic_name: string
          clinic_email: string
          clinic_phone: string
          clinic_address: string
          slot_interval_minutes: number
          booking_notice_hours: number
          created_at: string
        }
        Insert: {
          id?: string
          clinic_name: string
          clinic_email: string
          clinic_phone: string
          clinic_address: string
          slot_interval_minutes?: number
          booking_notice_hours?: number
          created_at?: string
        }
        Update: {
          id?: string
          clinic_name?: string
          clinic_email?: string
          clinic_phone?: string
          clinic_address?: string
          slot_interval_minutes?: number
          booking_notice_hours?: number
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
