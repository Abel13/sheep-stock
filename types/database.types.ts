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
      order_products: {
        Row: {
          id: string
          order_id: string | null
          product_code: string | null
          product_name: string | null
          quantity: number | null
          subtotal: number | null
          unit_price: number | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_code?: string | null
          product_name?: string | null
          quantity?: number | null
          subtotal?: number | null
          unit_price?: number | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_code?: string | null
          product_name?: string | null
          quantity?: number | null
          subtotal?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          discount: number | null
          icms: number | null
          icms_st: number | null
          id: string
          ipi: number | null
          purchase_date: string | null
          shipping_cost: number | null
          total_items: number | null
          total_products_value: number | null
          total_value: number | null
          total_weight: number | null
        }
        Insert: {
          discount?: number | null
          icms?: number | null
          icms_st?: number | null
          id?: string
          ipi?: number | null
          purchase_date?: string | null
          shipping_cost?: number | null
          total_items?: number | null
          total_products_value?: number | null
          total_value?: number | null
          total_weight?: number | null
        }
        Update: {
          discount?: number | null
          icms?: number | null
          icms_st?: number | null
          id?: string
          ipi?: number | null
          purchase_date?: string | null
          shipping_cost?: number | null
          total_items?: number | null
          total_products_value?: number | null
          total_value?: number | null
          total_weight?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          product_code: string
          product_name: string | null
          sale_price: number | null
          stock_quantity: number | null
        }
        Insert: {
          product_code: string
          product_name?: string | null
          sale_price?: number | null
          stock_quantity?: number | null
        }
        Update: {
          product_code?: string
          product_name?: string | null
          sale_price?: number | null
          stock_quantity?: number | null
        }
        Relationships: []
      }
      sale_products: {
        Row: {
          id: string
          product_code: string | null
          quantity: number
          sale_id: string | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          id?: string
          product_code?: string | null
          quantity: number
          sale_id?: string | null
          total_price?: number | null
          unit_price: number
        }
        Update: {
          id?: string
          product_code?: string | null
          quantity?: number
          sale_id?: string | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_products_product_code_fkey"
            columns: ["product_code"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_code"]
          },
          {
            foreignKeyName: "sale_products_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          id: string
          sale_date: string | null
          total_amount: number
        }
        Insert: {
          id?: string
          sale_date?: string | null
          total_amount: number
        }
        Update: {
          id?: string
          sale_date?: string | null
          total_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_average_price: {
        Args: {
          product_code_input: string
        }
        Returns: number
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
