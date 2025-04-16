import * as yup from 'yup';

declare module 'yup' {
  interface StringSchema {
    currency(message?: string): StringSchema;
    min_currency(min: number, message?: string): StringSchema;
  }
}

yup.addMethod(yup.string, 'currency', function (message = 'Invalid currency') {
  return this.test('currency', message, function (value) {
    if (!value) return true;
    const numValue = Number(value) / 100;
    return !isNaN(numValue);
  });
});

yup.addMethod(
  yup.string,
  'min_currency',
  function (min: number, message = `Must be at least R$ ${min},00`) {
    return this.test('min_currency', message, function (value) {
      if (!value) return true;
      const numValue = Number(value) / 100;
      return numValue >= min;
    });
  },
);

// Export the extended yup
export default yup;
