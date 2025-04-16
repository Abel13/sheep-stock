export const validSaleData = {
  customerName: 'John Doe',
  valuePaid: '10000', // R$ 100,00
  products: [
    {
      product_code: 'PROD1',
      product_name: 'Test Product',
      quantity: 1,
      unit_price: 5000, // R$ 50,00
      stock_quantity: 10,
    },
  ],
};

export const invalidSaleData = {
  customerName: '',
  valuePaid: '0',
  products: [],
};
