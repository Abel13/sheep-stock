import { Database } from './database.types';

export type SaleService = Database['public']['Tables']['sale_services']['Row'];
export type InsertSaleService =
  Database['public']['Tables']['sale_services']['Insert'];
export type UpdateSaleService =
  Database['public']['Tables']['sale_services']['Update'];
