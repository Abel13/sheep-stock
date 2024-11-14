import { Database } from "./database.types"

export type SaleProduct = Database['public']['Tables']['sale_products']['Row']
export type InsertSaleProduct = Database['public']['Tables']['sale_products']['Insert']
export type UpdateSaleProduct = Database['public']['Tables']['sale_products']['Update']