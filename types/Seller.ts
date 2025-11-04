import { Database } from './database.types';

export type Seller = Database['public']['Tables']['sellers']['Row'];
export type InsertSeller = Database['public']['Tables']['sellers']['Insert'];
export type UpdateSeller = Database['public']['Tables']['sellers']['Update'];
