import { Control } from 'react-hook-form';
import {
  CurrencyInput,
  CurrencyInputProps,
} from '@/components/atoms/CurrencyInput';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';

interface CurrencyFormFieldProps
  extends Omit<CurrencyInputProps, 'value' | 'onChange' | 'error'> {
  name: string;
  control: Control<any>;
  rules?: object;
}

export const CurrencyFormField = ({
  name,
  control,
  rules,
  ...props
}: CurrencyFormFieldProps) => {
  const inputProps = useCurrencyInput({ name, control, rules });

  return <CurrencyInput {...inputProps} {...props} />;
};
