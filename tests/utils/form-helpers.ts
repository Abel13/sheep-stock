import { fireEvent } from '@testing-library/react-native';

export const fillCurrencyInput = (input: any, value: string) => {
  fireEvent.changeText(input, value);
};

export const submitForm = async (
  getByText: any,
  buttonText = 'Finalizar Venda',
) => {
  fireEvent.press(getByText(buttonText));
};

export const fillCustomerForm = (
  getByPlaceholderText: any,
  data: {
    customerName?: string;
    valuePaid?: string;
  },
) => {
  if (data.customerName) {
    fireEvent.changeText(
      getByPlaceholderText('Nome do cliente'),
      data.customerName,
    );
  }

  if (data.valuePaid) {
    fireEvent.changeText(getByPlaceholderText('R$ 0,00'), data.valuePaid);
  }
};
