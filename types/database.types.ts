export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      order_products: {
        Row: {
          id: string;
          order_id: string | null;
          product_code: string | null;
          product_name: string | null;
          quantity: number | null;
          subtotal: number | null;
          unit_price: number | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          product_code?: string | null;
          product_name?: string | null;
          quantity?: number | null;
          subtotal?: number | null;
          unit_price?: number | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          product_code?: string | null;
          product_name?: string | null;
          quantity?: number | null;
          subtotal?: number | null;
          unit_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_products_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          cnpj: string | null;
          discount: number | null;
          icms: number | null;
          icms_st: number | null;
          id: string;
          ipi: number | null;
          purchase_date: string | null;
          shipping_cost: number | null;
          supplier: string | null;
          total_items: number | null;
          total_products_value: number | null;
          total_value: number | null;
          total_weight: number | null;
        };
        Insert: {
          cnpj?: string | null;
          discount?: number | null;
          icms?: number | null;
          icms_st?: number | null;
          id?: string;
          ipi?: number | null;
          purchase_date?: string | null;
          shipping_cost?: number | null;
          supplier?: string | null;
          total_items?: number | null;
          total_products_value?: number | null;
          total_value?: number | null;
          total_weight?: number | null;
        };
        Update: {
          cnpj?: string | null;
          discount?: number | null;
          icms?: number | null;
          icms_st?: number | null;
          id?: string;
          ipi?: number | null;
          purchase_date?: string | null;
          shipping_cost?: number | null;
          supplier?: string | null;
          total_items?: number | null;
          total_products_value?: number | null;
          total_value?: number | null;
          total_weight?: number | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          average_cost: number | null;
          discontinued: boolean | null;
          image_url: string | null;
          min_stock_quantity: number | null;
          minimum_stock: number | null;
          product_code: string;
          product_name: string | null;
          sale_price: number | null;
          stock_quantity: number | null;
        };
        Insert: {
          average_cost?: number | null;
          discontinued?: boolean | null;
          image_url?: string | null;
          min_stock_quantity?: number | null;
          minimum_stock?: number | null;
          product_code: string;
          product_name?: string | null;
          sale_price?: number | null;
          stock_quantity?: number | null;
        };
        Update: {
          average_cost?: number | null;
          discontinued?: boolean | null;
          image_url?: string | null;
          min_stock_quantity?: number | null;
          minimum_stock?: number | null;
          product_code?: string;
          product_name?: string | null;
          sale_price?: number | null;
          stock_quantity?: number | null;
        };
        Relationships: [];
      };
      sale_products: {
        Row: {
          id: string;
          product_code: string | null;
          quantity: number;
          sale_id: string | null;
          total_price: number | null;
          unit_price: number;
        };
        Insert: {
          id?: string;
          product_code?: string | null;
          quantity: number;
          sale_id?: string | null;
          total_price?: number | null;
          unit_price: number;
        };
        Update: {
          id?: string;
          product_code?: string | null;
          quantity?: number;
          sale_id?: string | null;
          total_price?: number | null;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'sale_products_product_code_fkey';
            columns: ['product_code'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['product_code'];
          },
          {
            foreignKeyName: 'sale_products_sale_id_fkey';
            columns: ['sale_id'];
            isOneToOne: false;
            referencedRelation: 'sales';
            referencedColumns: ['id'];
          },
        ];
      };
      sales: {
        Row: {
          customer_name: string | null;
          id: string;
          sale_date: string | null;
          total_amount: number;
          value_paid: number;
        };
        Insert: {
          customer_name?: string | null;
          id?: string;
          sale_date?: string | null;
          total_amount: number;
          value_paid?: number;
        };
        Update: {
          customer_name?: string | null;
          id?: string;
          sale_date?: string | null;
          total_amount?: number;
          value_paid?: number;
        };
        Relationships: [];
      };
      suggested_prices: {
        Row: {
          highlighted: boolean;
          price: number;
          product_code: string;
        };
        Insert: {
          highlighted: boolean;
          price: number;
          product_code: string;
        };
        Update: {
          highlighted?: boolean;
          price?: number;
          product_code?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_average_price: {
        Args: { product_code_input: string };
        Returns: number;
      };
      count_product_sales_by_period: {
        Args: { start_date: string; end_date: string };
        Returns: {
          product_code: string;
          name: string;
          total_sales: number;
        }[];
      };
      fetch_low_stock_products: {
        Args: Record<PropertyKey, never>;
        Returns: {
          product_code: string;
          product_name: string;
          stock_quantity: number;
          minimum_stock: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
