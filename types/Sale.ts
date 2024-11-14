import { Database } from "./database.types"

export type Sale = Database['public']['Tables']['sales']['Row']
export type InsertSale = Database['public']['Tables']['sales']['Insert']
export type UpdateSale = Database['public']['Tables']['sales']['Update']