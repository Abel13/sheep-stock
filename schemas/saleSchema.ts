import * as yup from 'yup';

export interface SaleFormData {
  customerName: string;
  sellerId: string;
  valuePaid: string;
  search?: string;
}

export const saleSchema = yup.object({
  customerName: yup.string().required('Nome do cliente é obrigatório'),
  sellerId: yup.string().required('Vendedor(a) é obrigatório'),
  valuePaid: yup
    .number()
    .required('Valor pago é obrigatório')
    .typeError('Valor inválido'),
});

export type SaleFormValues = {
  customerName: string;
  sellerId?: string;
  valuePaid: number;
};
