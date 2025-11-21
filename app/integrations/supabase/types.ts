
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
          },
        ]
      }
      carpool_rides: {
        Row: {
          arrival_city: string
          arrival_lat: number | null
          arrival_lng: number | null
          commission_yombal: number | null
          created_at: string | null
          date_paiement: string | null
          departure_city: string
          departure_datetime: string
          departure_lat: number | null
          departure_lng: number | null
          distance_km: number | null
          driver_name: string
          driver_phone: string
          duration_minutes: number | null
          id: string
          mode_paiement: string | null
          preuve_paiement: string | null
          price_per_seat: number
          prix_prestataire: number | null
          prix_total: number | null
          seats_available: number
          seats_total: number
          status: string | null
          statut_paiement: string | null
          stops: string | null
          vehicle_type: string | null
        }
        Insert: {
          arrival_city: string
          arrival_lat?: number | null
          arrival_lng?: number | null
          commission_yombal?: number | null
          created_at?: string | null
          date_paiement?: string | null
          departure_city: string
          departure_datetime: string
          departure_lat?: number | null
          departure_lng?: number | null
          distance_km?: number | null
          driver_name: string
          driver_phone: string
          duration_minutes?: number | null
          id?: string
          mode_paiement?: string | null
          preuve_paiement?: string | null
          price_per_seat: number
          prix_prestataire?: number | null
          prix_total?: number | null
          seats_available: number
          seats_total: number
          status?: string | null
          statut_paiement?: string | null
          stops?: string | null
          vehicle_type?: string | null
        }
        Update: {
          arrival_city?: string
          arrival_lat?: number | null
          arrival_lng?: number | null
          commission_yombal?: number | null
          created_at?: string | null
          date_paiement?: string | null
          departure_city?: string
          departure_datetime?: string
          departure_lat?: number | null
          departure_lng?: number | null
          distance_km?: number | null
          driver_name?: string
          driver_phone?: string
          duration_minutes?: number | null
          id?: string
          mode_paiement?: string | null
          preuve_paiement?: string | null
          price_per_seat?: number
          prix_prestataire?: number | null
          prix_total?: number | null
          seats_available?: number
          seats_total?: number
          status?: string | null
          statut_paiement?: string | null
          stops?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      demandes_retrait: {
        Row: {
          date_demande: string
          date_traitement: string | null
          id: string
          mode_paiement: string
          montant: number
          motif_refus: string | null
          numero_telephone: string
          statut: string
          traite_par: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          date_demande?: string
          date_traitement?: string | null
          id?: string
          mode_paiement: string
          montant: number
          motif_refus?: string | null
          numero_telephone: string
          statut?: string
          traite_par?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          date_demande?: string
          date_traitement?: string | null
          id?: string
          mode_paiement?: string
          montant?: number
          motif_refus?: string | null
          numero_telephone?: string
          statut?: string
          traite_par?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandes_retrait_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_retrait_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          completed_deliveries: number | null
          created_at: string | null
          id: string
          last_lat: number | null
          last_lng: number | null
          name: string
          phone: string
          rating: number | null
          status: string
          vehicle_type: string | null
        }
        Insert: {
          completed_deliveries?: number | null
          created_at?: string | null
          id: string
          last_lat?: number | null
          last_lng?: number | null
          name: string
          phone: string
          rating?: number | null
          status?: string
          vehicle_type?: string | null
        }
        Update: {
          completed_deliveries?: number | null
          created_at?: string | null
          id?: string
          last_lat?: number | null
          last_lng?: number | null
          name?: string
          phone?: string
          rating?: number | null
          status?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          message: string
          source: string
          type: string
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id?: string
          message: string
          source: string
          type: string
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          message?: string
          source?: string
          type?: string
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
      parcel_logs: {
        Row: {
          created_at: string | null
          distance_km: number | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          id: string
          parcel_id: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          price_fcfa: number | null
          recipient_phone: string
          sender_phone: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          distance_km?: number | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          parcel_id?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price_fcfa?: number | null
          recipient_phone: string
          sender_phone: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          distance_km?: number | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          parcel_id?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price_fcfa?: number | null
          recipient_phone?: string
          sender_phone?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcel_logs_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assigned_driver_id: string | null
          commission_yombal: number | null
          created_at: string | null
          date_paiement: string | null
          delivered_at: string | null
          description: string | null
          distance_km: number | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          id: string
          mode_paiement: string | null
          picked_up_at: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          preuve_paiement: string | null
          price_fcfa: number | null
          prix_prestataire: number | null
          prix_total: number | null
          recipient_name: string
          recipient_phone: string
          refused_at: string | null
          refused_reason: string | null
          sender_id: string | null
          sender_name: string
          sender_phone: string
          status: string | null
          statut_paiement: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_driver_id?: string | null
          commission_yombal?: number | null
          created_at?: string | null
          date_paiement?: string | null
          delivered_at?: string | null
          description?: string | null
          distance_km?: number | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          mode_paiement?: string | null
          picked_up_at?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          preuve_paiement?: string | null
          price_fcfa?: number | null
          prix_prestataire?: number | null
          prix_total?: number | null
          recipient_name: string
          recipient_phone: string
          refused_at?: string | null
          refused_reason?: string | null
          sender_id?: string | null
          sender_name: string
          sender_phone: string
          status?: string | null
          statut_paiement?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_driver_id?: string | null
          commission_yombal?: number | null
          created_at?: string | null
          date_paiement?: string | null
          delivered_at?: string | null
          description?: string | null
          distance_km?: number | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          mode_paiement?: string | null
          picked_up_at?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          preuve_paiement?: string | null
          price_fcfa?: number | null
          prix_prestataire?: number | null
          prix_total?: number | null
          recipient_name?: string
          recipient_phone?: string
          refused_at?: string | null
          refused_reason?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_phone?: string
          status?: string | null
          statut_paiement?: string | null
        }
        Relationships: []
      }
      recharges_wallet: {
        Row: {
          date_demande: string
          date_validation: string | null
          id: string
          mode_paiement: string
          montant: number
          motif_refus: string | null
          statut: string
          transaction_id: string | null
          user_id: string
          valide_par: string | null
          wallet_id: string
        }
        Insert: {
          date_demande?: string
          date_validation?: string | null
          id?: string
          mode_paiement: string
          montant: number
          motif_refus?: string | null
          statut?: string
          transaction_id?: string | null
          user_id: string
          valide_par?: string | null
          wallet_id: string
        }
        Update: {
          date_demande?: string
          date_validation?: string | null
          id?: string
          mode_paiement?: string
          montant?: number
          motif_refus?: string | null
          statut?: string
          transaction_id?: string | null
          user_id?: string
          valide_par?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recharges_wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recharges_wallet_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_wallet: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          montant: number
          solde_apres: number
          solde_avant: number
          type: string
          wallet_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          montant: number
          solde_apres: number
          solde_avant: number
          type: string
          wallet_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          montant?: number
          solde_apres?: number
          solde_avant?: number
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_phone_verified: boolean | null
          phone_number: string
          phone_verified_at: string | null
          roles: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_phone_verified?: boolean | null
          phone_number: string
          phone_verified_at?: string | null
          roles?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_phone_verified?: boolean | null
          phone_number?: string
          phone_verified_at?: string | null
          roles?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          created_at: string
          id: string
          solde: number
          solde_bloque: number
          total_commissions: number
          total_gagne: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          solde?: number
          solde_bloque?: number
          total_commissions?: number
          total_gagne?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          solde?: number
          solde_bloque?: number
          total_commissions?: number
          total_gagne?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
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
