import { saleSchema } from './saleSchema';

describe('saleSchema', () => {
  it('validates valid data', async () => {
    const validData = {
      customerName: 'John Doe',
      valuePaid: '10000', // R$ 100,00
    };

    const context = { totalAmount: 90 }; // R$ 90,00

    await expect(
      saleSchema.validate(validData, { context }),
    ).resolves.toBeTruthy();
  });

  it('rejects empty customer name', async () => {
    const invalidData = {
      customerName: '',
      valuePaid: '10000',
    };

    await expect(saleSchema.validate(invalidData)).rejects.toThrow(
      'Nome do cliente é obrigatório',
    );
  });

  it('rejects short customer name', async () => {
    const invalidData = {
      customerName: 'Jo',
      valuePaid: '10000',
    };

    await expect(saleSchema.validate(invalidData)).rejects.toThrow(
      'Nome deve ter pelo menos 3 caracteres',
    );
  });
});
