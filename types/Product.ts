import { Database } from './database.types';

export type Product = Database['public']['Tables']['products']['Row'];
export type InsertProduct = Database['public']['Tables']['products']['Insert'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];
