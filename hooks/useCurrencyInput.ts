import { useController, Control } from 'react-hook-form';

interface UseCurrencyInputProps {
  name: string;
  control: Control<any>;
  rules?: object;
}

export const useCurrencyInput = ({
  name,
  control,
  rules,
}: UseCurrencyInputProps) => {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  return {
    value,
    onChange,
    error: error?.message,
    ref,
  };
};
