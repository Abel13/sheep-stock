import { Alert } from 'react-native';
import { supabase } from './supabaseClient';

const createSale = async ({
  saleData,
  saleProducts,
}: {
  saleData: any;
  saleProducts: any[];
}) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([saleData])
    .select();
  if (error) throw new Error(error.code);
  const saleId = data[0].id;

  const productsData = saleProducts.map(product => ({
    sale_id: saleId,
    product_code: product.product_code,
    quantity: product.quantity,
    unit_price: product.unit_price || 0,
  }));
  const { error: errorProducts } = await supabase
    .from('sale_products')
    .insert(productsData);

  if (errorProducts) {
    await supabase.from('sales').delete().eq('id', saleId);
    throw new Error(errorProducts.code);
  }
};

export { createSale };
