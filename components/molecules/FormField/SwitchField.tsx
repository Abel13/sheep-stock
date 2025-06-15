import { Controller, Control } from 'react-hook-form';
import { Switch, SwitchProps } from 'tamagui';

interface SwitchFormFieldProps
  extends Omit<SwitchProps, 'checked' | 'onCheckedChange'> {
  name: string;
  control: Control<any>;
  rules?: object;
}

export const SwitchFormField = ({
  name,
  control,
  rules,
  ...props
}: SwitchFormFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange } }) => (
        <Switch checked={value} onCheckedChange={onChange} {...props} />
      )}
    />
  );
};
