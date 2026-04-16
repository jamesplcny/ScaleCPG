export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type ManufacturerProfile = Database["public"]["Tables"]["manufacturer_profiles"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type BrandUser = Database["public"]["Tables"]["brand_users"]["Row"];
export type AdminManufacturer = Database["public"]["Tables"]["admin_manufacturers"]["Row"];
export type AdminManufacturerInvitation = Database["public"]["Tables"]["admin_manufacturer_invitations"]["Row"];
export type ManufacturerUser = Database["public"]["Tables"]["manufacturer_users"]["Row"];
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type ChatLead = Database["public"]["Tables"]["chat_leads"]["Row"];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      user_roles: {
        Row: {
          user_id: string;
          role: "brand_user" | "manufacturer_user" | "manufacturer_admin" | "super_admin";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_roles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      manufacturer_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          company_description: string;
          location: string;
          years_in_business: number;
          capabilities: string[];
          moq: string;
          lead_time: string;
          verified: boolean;
          public_slug: string;
          profile_visibility: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          company_name: string;
          company_description?: string;
          location?: string;
          years_in_business?: number;
          capabilities?: string[];
          moq?: string;
          lead_time?: string;
          verified?: boolean;
          public_slug?: string;
          profile_visibility?: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["manufacturer_profiles"]["Insert"]>;
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          website: string;
          primary_contact_name: string;
          sales_channels: string[];
          product_categories: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["brands"]["Row"], "id" | "created_at" | "description" | "website" | "primary_contact_name" | "sales_channels" | "product_categories"> & { description?: string; website?: string; primary_contact_name?: string; sales_channels?: string[]; product_categories?: string[] };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
        Relationships: [];
      };
      brand_users: {
        Row: {
          id: string;
          brand_id: string;
          user_id: string | null;
          invited_email: string | null;
          role: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["brand_users"]["Row"], "id" | "created_at" | "role" | "status"> & { role?: string; status?: string };
        Update: Partial<Database["public"]["Tables"]["brand_users"]["Insert"]>;
        Relationships: [];
      };
      admin_manufacturers: {
        Row: {
          id: string;
          company_name: string;
          manufacturer_profile_id: string | null;
          config: Record<string, unknown>;
          status: string;
          created_by_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          company_name: string;
          manufacturer_profile_id?: string | null;
          config?: Record<string, unknown>;
          status?: string;
          created_by_user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_manufacturers"]["Insert"]>;
        Relationships: [];
      };
      admin_manufacturer_invitations: {
        Row: {
          id: string;
          admin_manufacturer_id: string;
          email: string;
          status: string;
          invited_by_user_id: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          admin_manufacturer_id: string;
          email: string;
          invited_by_user_id: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_manufacturer_invitations"]["Insert"]>;
        Relationships: [];
      };
      manufacturer_users: {
        Row: {
          id: string;
          admin_manufacturer_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          admin_manufacturer_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
        };
        Update: {
          role?: "owner" | "admin" | "member";
        };
        Relationships: [];
      };
      chat_sessions: {
        Row: {
          id: string;
          manufacturer_id: string;
          status: string;
          lead_data: Record<string, unknown>;
          lead_score: number;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          manufacturer_id: string;
          status?: string;
          lead_data?: Record<string, unknown>;
          lead_score?: number;
        };
        Update: {
          status?: string;
          lead_data?: Record<string, unknown>;
          lead_score?: number;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          raw_content: string | null;
          extracted_fields: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          session_id: string;
          role: string;
          content: string;
          raw_content?: string | null;
          extracted_fields?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: [];
      };
      chat_leads: {
        Row: {
          id: string;
          session_id: string;
          manufacturer_id: string;
          lead_data: Record<string, unknown>;
          lead_score: number;
          summary: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          session_id: string;
          manufacturer_id: string;
          lead_data?: Record<string, unknown>;
          lead_score?: number;
          summary?: string | null;
          status?: string;
        };
        Update: {
          lead_data?: Record<string, unknown>;
          lead_score?: number;
          summary?: string | null;
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
