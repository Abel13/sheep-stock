import { useController, Control } from 'react-hook-form';

interface UseSwitchProps {
  name: string;
  control: Control<any>;
  rules?: object;
}

export const useSwitch = ({ name, control, rules }: UseSwitchProps) => {
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
