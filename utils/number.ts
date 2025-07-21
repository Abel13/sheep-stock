// export const formatCurrency = (value: number | string): string => {
//   const numericValue = typeof value === 'string' ? Number(value) : value;
//   return new Intl.NumberFormat('pt-BR', {
//     style: 'currency',
//     currency: 'BRL',
//   }).format(numericValue);
// };

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

/**
 * Converte um número ou string numérica para uma string formatada no padrão `pt-BR`.
 *
 * @param value - Valor a ser formatado. Pode ser um número, uma string numérica (formato brasileiro ou americano), ou `null`/`undefined`.
 * @param type - Estilo de formatação: `'decimal'` (padrão), `'percent'` ou `'currency'`.
 * @param currency - Código da moeda (ex: `'BRL'` para Real). Obrigatório apenas se o tipo for `'currency'`.
 * @param fractionalDigits - Número de casas decimais. Padrão: 2.
 * @returns A string formatada conforme o estilo escolhido. Se o valor for inválido ou nulo, retorna `'0,00'`, `'0%'` ou `'R$ 0,00'`, dependendo do tipo.
 *
 * @example
 * convertNumberToPtBrString({ value: 10202.35 });
 * // Retorna: '10.202,35'
 *
 * @example
 * convertNumberToPtBrString({ value: '10202,35' });
 * // Retorna: '10.202,35'
 *
 * @example
 * convertNumberToPtBrString({ value: 0.53, type: 'percent' });
 * // Retorna: '53%'
 *
 * @example
 * convertNumberToPtBrString({ value: '10202.35', type: 'currency', currency: 'BRL' });
 * // Retorna: 'R$ 10.202,35'
 *
 * @example
 * convertNumberToPtBrString({ value: null, type: 'currency', currency: 'BRL' });
 * // Retorna: 'R$ 0,00'
 */
export function convertNumberToLocaleString({
  value,
  type = 'decimal',
  currency = 'BRL',
  locale = 'pt-BR',
  fractionalDigits = 2,
}: {
  value: number | string | null | undefined;
  type?: 'decimal' | 'percent' | 'currency';
  currency?: string;
  fractionalDigits?: number;
  locale?: string;
}): string {
  let numericValue: number = 0;

  if (typeof value === 'string') {
    numericValue = Number(value.replace('.', '').replace(',', '.'));
  } else if (typeof value === 'number' && !isNaN(value)) {
    numericValue = value;
  }

  if (
    isNaN(numericValue) ||
    numericValue === null ||
    numericValue === undefined
  ) {
    numericValue = 0;
  }

  if (type === 'percent') {
    numericValue = numericValue / 100;
  }

  return numericValue.toLocaleString(locale, {
    style: type,
    currency: type === 'currency' ? currency : undefined,
    minimumFractionDigits: fractionalDigits,
    maximumFractionDigits: fractionalDigits,
  });
}
