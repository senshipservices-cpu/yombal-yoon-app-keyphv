
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
      carpool_bookings: {
        Row: {
          created_at: string | null
          id: string
          number_of_passengers: number
          passenger_name: string
          passenger_phone: string
          ride_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          number_of_passengers: number
          passenger_name: string
          passenger_phone: string
          ride_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          number_of_passengers?: number
          passenger_name?: string
          passenger_phone?: string
          ride_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carpool_bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "carpool_rides"
            referencedColumns: ["id"]
          }
        ]
      }
      carpool_rides: {
        Row: {
          arrival_city: string
          arrival_lat: number | null
          arrival_lng: number | null
          created_at: string | null
          departure_city: string
          departure_datetime: string
          departure_lat: number | null
          departure_lng: number | null
          distance_km: number | null
          driver_name: string
          driver_phone: string
          duration_minutes: number | null
          id: string
          price_per_seat: number
          seats_available: number
          seats_total: number
          status: string | null
          stops: string | null
          vehicle_type: string | null
        }
        Insert: {
          arrival_city: string
          arrival_lat?: number | null
          arrival_lng?: number | null
          created_at?: string | null
          departure_city: string
          departure_datetime: string
          departure_lat?: number | null
          departure_lng?: number | null
          distance_km?: number | null
          driver_name: string
          driver_phone: string
          duration_minutes?: number | null
          id?: string
          price_per_seat: number
          seats_available: number
          seats_total: number
          status?: string | null
          stops?: string | null
          vehicle_type?: string | null
        }
        Update: {
          arrival_city?: string
          arrival_lat?: number | null
          arrival_lng?: number | null
          created_at?: string | null
          departure_city?: string
          departure_datetime?: string
          departure_lat?: number | null
          departure_lng?: number | null
          distance_km?: number | null
          driver_name?: string
          driver_phone?: string
          duration_minutes?: number | null
          id?: string
          price_per_seat?: number
          seats_available?: number
          seats_total?: number
          status?: string | null
          stops?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          id: string
          created_at: string | null
          type: string
          message: string
          contact: string | null
          source: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          type: string
          message: string
          contact?: string | null
          source: string
        }
        Update: {
          id?: string
          created_at?: string | null
          type?: string
          message?: string
          contact?: string | null
          source?: string
        }
        Relationships: []
      }
      intercity_deliveries: {
        Row: {
          created_at: string | null
          departure_region: string
          description: string | null
          destination_city: string | null
          destination_region: string
          id: string
          price_fcfa: number | null
          recipient_name: string
          recipient_phone: string
          sender_name: string
          sender_phone: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          departure_region: string
          description?: string | null
          destination_city?: string | null
          destination_region: string
          id?: string
          price_fcfa?: number | null
          recipient_name: string
          recipient_phone: string
          sender_name: string
          sender_phone: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          departure_region?: string
          description?: string | null
          destination_city?: string | null
          destination_region?: string
          id?: string
          price_fcfa?: number | null
          recipient_name?: string
          recipient_phone?: string
          sender_name?: string
          sender_phone?: string
          status?: string | null
        }
        Relationships: []
      }
      parcels: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          delivered_at: string | null
          description: string | null
          distance_km: number | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          id: string
          picked_up_at: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          price_fcfa: number | null
          recipient_name: string
          recipient_phone: string
          sender_name: string
          sender_phone: string
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          description?: string | null
          distance_km?: number | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          picked_up_at?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price_fcfa?: number | null
          recipient_name: string
          recipient_phone: string
          sender_name: string
          sender_phone: string
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          description?: string | null
          distance_km?: number | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          picked_up_at?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price_fcfa?: number | null
          recipient_name?: string
          recipient_phone?: string
          sender_name?: string
          sender_phone?: string
          status?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
