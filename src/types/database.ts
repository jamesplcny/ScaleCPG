export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type ManufacturerProfile = Database["public"]["Tables"]["manufacturer_profiles"]["Row"];

export type ManufacturerCapability = Database["public"]["Tables"]["manufacturer_capabilities"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type BrandUser = Database["public"]["Tables"]["brand_users"]["Row"];
export type BrandProduct = Database["public"]["Tables"]["brand_products"]["Row"];
export type BrandManufacturerApplication = Database["public"]["Tables"]["brand_manufacturer_applications"]["Row"];

export type PackagingVaultItem = Database["public"]["Tables"]["packaging_vault_items"]["Row"];
export type PopularVaultItem = Database["public"]["Tables"]["popular_vault_items"]["Row"];
export type AccessoryVaultItem = Database["public"]["Tables"]["accessory_vault_items"]["Row"];
export type ProductCatalogRequest = Database["public"]["Tables"]["product_catalog_requests"]["Row"];
export type ApprovedProduct = Database["public"]["Tables"]["approved_products"]["Row"];
export type PurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Row"];
export type PurchaseOrderItem = Database["public"]["Tables"]["purchase_order_items"]["Row"];
export type StatusReportItem = Database["public"]["Tables"]["status_report_items"]["Row"];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          name: string;
          brand_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          client_id: string | null;
          client_name: string;
          product_name: string;
          quantity: number;
          status: string;
          shipment_type: string;
          requested_date: string;
          requested_due_date: string | null;
          ups_labels_uploaded: boolean;
          delay_note: string | null;
          brand_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          name: string;
          quantity: number;
          unit: string;
          brand_id: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inventory_items"]["Insert"]>;
        Relationships: [];
      };
      client_products: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          product_id: string;
          active: boolean;
          ingredient_list: string;
          packaging: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["client_products"]["Row"], "id" | "created_at" | "active" | "ingredient_list" | "packaging"> & { active?: boolean; ingredient_list?: string; packaging?: string[] };
        Update: Partial<Database["public"]["Tables"]["client_products"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: "brand_user" | "manufacturer_user" | "manufacturer_admin";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_roles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          title: string;
          description: string;
          severity: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["alerts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
        Relationships: [];
      };
      formulations: {
        Row: {
          id: string;
          name: string;
          category: string;
          subtitle: string;
          ingredients: string[];
          packaging_options: string[];
          add_ons: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["formulations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["formulations"]["Insert"]>;
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          accent_color: string;
          time_label: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["activities"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
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
      manufacturer_capabilities: {
        Row: {
          id: string;
          user_id: string;
          capability: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["manufacturer_capabilities"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["manufacturer_capabilities"]["Insert"]>;
        Relationships: [];
      };
      profile_skus: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profile_skus"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["profile_skus"]["Insert"]>;
        Relationships: [];
      };
      client_users: {
        Row: {
          id: string;
          auth_user_id: string;
          client_id: string;
          manufacturer_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["client_users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["client_users"]["Insert"]>;
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
      ups_shipments: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          client_id: string;
          order_number: string;
          client_name: string;
          product_name: string;
          quantity: number;
          box_length: number;
          box_width: number;
          box_height: number;
          box_weight: number;
          units_per_box: number;
          num_boxes: number;
          requested_date: string;
          label_requested_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ups_shipments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["ups_shipments"]["Insert"]>;
        Relationships: [];
      };
      brand_manufacturer_applications: {
        Row: {
          id: string;
          brand_id: string;
          manufacturer_id: string;
          created_by_user_id: string;
          tell_us_about_yourself: string;
          what_are_you_looking_for: string;
          already_selling: boolean;
          selling_details: string | null;
          packaging_preference: string;
          expected_order_quantity: string;
          status: string;
          rejection_reason: string | null;
          rejected_until: string | null;
          accepted_at: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          brand_id: string;
          manufacturer_id: string;
          created_by_user_id: string;
          tell_us_about_yourself: string;
          what_are_you_looking_for: string;
          already_selling?: boolean;
          selling_details?: string | null;
          packaging_preference: string;
          expected_order_quantity: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brand_manufacturer_applications"]["Insert"]> & {
          rejection_reason?: string | null;
          rejected_until?: string | null;
          accepted_at?: string | null;
          reviewed_at?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          brand_id: string;
          manufacturer_id: string;
          application_id: string | null;
          created_at: string;
        };
        Insert: {
          brand_id: string;
          manufacturer_id: string;
          application_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [];
      };
      conversation_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_user_id: string;
          sender_role: string;
          body: string;
          message_type: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          sender_user_id: string;
          sender_role: string;
          body: string;
          message_type?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["conversation_messages"]["Insert"]>;
        Relationships: [];
      };
      packaging_vault_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          packaging_type: string;
          description: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["packaging_vault_items"]["Row"], "id" | "created_at" | "packaging_type" | "description"> & { packaging_type?: string; description?: string };
        Update: Partial<Database["public"]["Tables"]["packaging_vault_items"]["Insert"]>;
        Relationships: [];
      };
      product_catalog_requests: {
        Row: {
          id: string;
          brand_id: string;
          manufacturer_id: string;
          popular_item_id: string | null;
          request_type: string;
          item_name: string;
          request_body: string;
          conversation_id: string | null;
          created_by_user_id: string;
          status: string;
          desired_quantity: string | null;
          packaging_selection: string | null;
          accessory_selections: string | null;
          additional_comments: string | null;
          shipment_method: string | null;
          created_at: string;
        };
        Insert: {
          brand_id: string;
          manufacturer_id: string;
          popular_item_id?: string | null;
          request_type: string;
          item_name: string;
          request_body: string;
          conversation_id?: string | null;
          created_by_user_id: string;
          status?: string;
          desired_quantity?: string | null;
          packaging_selection?: string | null;
          accessory_selections?: string | null;
          additional_comments?: string | null;
          shipment_method?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_catalog_requests"]["Insert"]>;
        Relationships: [];
      };
      popular_vault_items: {
        Row: {
          id: string;
          user_id: string;
          item_name: string;
          ingredient_list: string;
          selling_points: string[];
          packaging_ids: string[];
          accessory_ids: string[];
          how_to_use: string;
          price_min: number | null;
          price_max: number | null;
          moq: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          item_name: string;
          ingredient_list: string;
          selling_points?: string[];
          packaging_ids?: string[];
          accessory_ids?: string[];
          how_to_use?: string;
          price_min?: number | null;
          price_max?: number | null;
          moq: number;
        };
        Update: Partial<Database["public"]["Tables"]["popular_vault_items"]["Insert"]>;
        Relationships: [];
      };
      accessory_vault_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["accessory_vault_items"]["Row"], "id" | "created_at" | "description"> & { description?: string };
        Update: Partial<Database["public"]["Tables"]["accessory_vault_items"]["Insert"]>;
        Relationships: [];
      };
      brand_products: {
        Row: {
          id: string;
          brand_id: string;
          name: string;
          sku: string | null;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          brand_id: string;
          name: string;
          sku?: string | null;
          notes?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brand_products"]["Insert"]>;
        Relationships: [];
      };
      approved_products: {
        Row: {
          id: string;
          brand_id: string;
          manufacturer_id: string;
          source_request_id: string | null;
          item_name: string;
          ingredient_list: string;
          packaging: string;
          accessories: string | null;
          price_per_unit: number | null;
          note: string | null;
          status: string;
          approved_at: string;
          created_at: string;
        };
        Insert: {
          brand_id: string;
          manufacturer_id: string;
          source_request_id?: string | null;
          item_name: string;
          ingredient_list: string;
          packaging: string;
          accessories?: string | null;
          price_per_unit?: number | null;
          note?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["approved_products"]["Insert"]>;
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          id: string;
          brand_id: string;
          manufacturer_id: string;
          created_by_user_id: string;
          status: string;
          ready_by_date: string | null;
          note: string | null;
          place_of_delivery: string | null;
          market: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          brand_id: string;
          manufacturer_id: string;
          created_by_user_id: string;
          status?: string;
          ready_by_date?: string | null;
          note?: string | null;
          place_of_delivery?: string | null;
          market?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["purchase_orders"]["Insert"]> & {
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          approved_product_id: string;
          item_name: string;
          quantity: number;
          shipping_method: string | null;
          target_pickup_date: string | null;
          created_at: string;
        };
        Insert: {
          purchase_order_id: string;
          approved_product_id: string;
          item_name: string;
          quantity: number;
          shipping_method?: string | null;
          target_pickup_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["purchase_order_items"]["Insert"]>;
        Relationships: [];
      };
      status_report_items: {
        Row: {
          id: string;
          manufacturer_id: string;
          purchase_order_id: string;
          purchase_order_item_id: string;
          brand_id: string;
          status: string;
          note: string | null;
          added_at: string;
          shipping_method: string | null;
          box_length: number | null;
          box_width: number | null;
          box_height: number | null;
          box_weight: number | null;
          box_count: number | null;
          pallet_length: number | null;
          pallet_width: number | null;
          pallet_height: number | null;
          pallet_weight: number | null;
          pallet_count: number | null;
          expiration_date: string | null;
          lot_number: string | null;
          shipping_sent_at: string | null;
        };
        Insert: {
          manufacturer_id: string;
          purchase_order_id: string;
          purchase_order_item_id: string;
          brand_id: string;
          status?: string;
          note?: string | null;
          shipping_method?: string | null;
          box_length?: number | null;
          box_width?: number | null;
          box_height?: number | null;
          box_weight?: number | null;
          box_count?: number | null;
          pallet_length?: number | null;
          pallet_width?: number | null;
          pallet_height?: number | null;
          pallet_weight?: number | null;
          pallet_count?: number | null;
          expiration_date?: string | null;
          lot_number?: string | null;
          shipping_sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["status_report_items"]["Insert"]> & {
          status?: string;
          note?: string | null;
          shipping_sent_at?: string | null;
        };
        Relationships: [];
      };
      shipment_requests: {
        Row: {
          id: string;
          brand_id: string;
          manufacturer_id: string;
          shipping_method: string;
          pickup_date: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          brand_id: string;
          manufacturer_id: string;
          shipping_method: string;
          pickup_date?: string | null;
          status?: string;
        };
        Update: {
          status?: string;
          pickup_date?: string | null;
        };
        Relationships: [];
      };
      shipment_request_items: {
        Row: {
          id: string;
          shipment_request_id: string;
          status_report_item_id: string;
        };
        Insert: {
          shipment_request_id: string;
          status_report_item_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
