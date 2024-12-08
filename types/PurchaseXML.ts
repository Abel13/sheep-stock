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
  purchase_date: string;
  order_products: ProductXML[];
}
