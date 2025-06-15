import { ItemSaleProduct, ItemSaleService } from '@/types/ItemSale';
import { supabase } from './supabaseClient';
import { InsertSaleService } from '@/types/SaleService';
import { InsertSaleProduct } from '@/types/SaleProduct';

const createSale = async ({
  saleData,
  saleProducts,
  saleServices,
}: {
  saleData: any;
  saleProducts: ItemSaleProduct[];
  saleServices: ItemSaleService[];
}) => {
  try {
  } catch (error) {}
  const { data, error } = await supabase
    .from('sales')
    .insert([saleData])
    .select();
  if (error) throw new Error(error.code);
  const saleId = data[0].id;

  const serviceData: InsertSaleService[] = saleServices.map(service => ({
    sale_id: saleId,
    service_code: service.service_code,
    price: service.price,
  }));

  if (serviceData.length > 0) {
    const { error: errorServices } = await supabase
      .from('sale_services')
      .insert(serviceData);

    if (errorServices) {
      await supabase.from('sales').delete().eq('id', saleId);
      return;
    }
  }

  const productsData: InsertSaleProduct[] = saleProducts.map(product => ({
    sale_id: saleId,
    product_code: product.product_code,
    quantity: product.quantity,
    unit_price: product.sale_price,
  }));

  if (productsData.length > 0) {
    const { error: errorProducts } = await supabase
      .from('sale_products')
      .insert(productsData);

    if (errorProducts) {
      await supabase.from('sales').delete().eq('id', saleId);
    }
  }
};

export { createSale };
