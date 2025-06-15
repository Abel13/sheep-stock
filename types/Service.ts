import { Database } from './database.types';

export type Service = Database['public']['Tables']['services']['Row'];
export type InsertService = Database['public']['Tables']['services']['Insert'];
export type UpdateService = Database['public']['Tables']['services']['Update'];
