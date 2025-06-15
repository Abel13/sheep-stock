export function applyMask(cnpj: string) {
  cnpj = cnpj.replace(/\D/g, '');
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
}
