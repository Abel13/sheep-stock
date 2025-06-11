export interface ProductXML {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface PurchaseXML {
  supplier: string;
  cnpj: string;
  discount: number;
  icms: number;
  purchase_date: string;
  icms_st: number;
  ipi: number;
  shipping_cost: number;
  total_items: number;
  total_products_value: number;
  total_value: number;
  total_weight: number;
  order_products: ProductXML[];
}
