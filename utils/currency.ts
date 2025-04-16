export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

export const parseCurrency = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return Number(numbers) / 100;
};

export const toCents = (value: number): number => {
  return Math.round(value * 100);
};

export const fromCents = (value: number): number => {
  return value / 100;
};
