import { InsertService, UpdateService } from '@/types/Service';
import { supabase } from './supabaseClient';

const createService = async ({
  serviceData,
}: {
  serviceData: InsertService;
}) => {
  const { error } = await supabase
    .from('services')
    .insert([serviceData])
    .select();

  if (error) throw new Error(error.code);
};

const updateService = async ({
  id,
  serviceData,
}: {
  id: string;
  serviceData: UpdateService;
}) => {
  const { error } = await supabase
    .from('services')
    .update(serviceData)
    .eq('service_code', id)
    .select();

  if (error) throw new Error(error.code);
};

export { createService, updateService };
