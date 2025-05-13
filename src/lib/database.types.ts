export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          full_name: string | null;
          date_of_birth: string | null;
          time_of_birth: string | null;
          place_of_birth: string | null;
          phone_number: string | null;
          current_location: string | null;
          updated_at: string | null;
          whatsapp_notifications: boolean;
          whatsapp_number: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          time_of_birth?: string | null;
          place_of_birth?: string | null;
          phone_number?: string | null;
          current_location?: string | null;
          updated_at?: string | null;
          whatsapp_notifications?: boolean;
          whatsapp_number?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          time_of_birth?: string | null;
          place_of_birth?: string | null;
          phone_number?: string | null;
          current_location?: string | null;
          updated_at?: string | null;
          whatsapp_notifications?: boolean;
          whatsapp_number?: string | null;
        };
      };
      predictions: {
        Row: {
          id: string;
          created_at: string;
          profile_id: string;
          prediction_text: string;
          is_sent: boolean;
          sent_at: string | null;
          astro_data: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          profile_id: string;
          prediction_text: string;
          is_sent?: boolean;
          sent_at?: string | null;
          astro_data?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          profile_id?: string;
          prediction_text?: string;
          is_sent?: boolean;
          sent_at?: string | null;
          astro_data?: Record<string, any> | null;
        };
      };
      whatsapp_notification_logs: {
        Row: {
          id: string;
          created_at: string;
          profile_id: string | null;
          prediction_id: string | null;
          status: string;
          error_message: string | null;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          profile_id?: string | null;
          prediction_id?: string | null;
          status: string;
          error_message?: string | null;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          profile_id?: string | null;
          prediction_id?: string | null;
          status?: string;
          error_message?: string | null;
          sent_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}