export interface ItemSaleProduct {
  index: number;
  product_code: string;
  stock_quantity: number;
  product_name: string;
  sale_price: number;
  quantity: number;
}

export interface ItemSaleService {
  index: number;
  price: number;
  service_code: string;
  name: string;
}

export interface SearchItemProps {
  code: string;
  name: string;
  price: number;
  stock_quantity: number;
  type: 'PRODUCT' | 'SERVICE';
}

export interface ItemSale {
  index: number;
  code: string;
  name: string;
  price: number;
  stock_quantity: number;
  quantity: number;
}
