import yup from './yupExtensions';

describe('Yup Currency Extensions', () => {
  const schema = yup.object({
    amount: yup
      .string()
      .currency('Invalid currency')
      .min_currency(10, 'Must be at least R$ 10,00'),
  });

  it('validates valid currency', async () => {
    const validData = { amount: '1000' }; // R$ 10,00
    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it('rejects invalid currency format', async () => {
    const invalidData = { amount: 'abc' };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      'Invalid currency',
    );
  });

  it('validates minimum currency value', async () => {
    const invalidData = { amount: '500' }; // R$ 5,00
    await expect(schema.validate(invalidData)).rejects.toThrow(
      'Must be at least R$ 10,00',
    );
  });
});
