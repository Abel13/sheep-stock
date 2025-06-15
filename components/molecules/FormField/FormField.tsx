import { Input, Text, YStack, InputProps } from 'tamagui';
import { Control, useController } from 'react-hook-form';

interface FormFieldProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  name: string;
  control: Control<any>;
  label?: string;
}

export const FormField = ({
  name,
  control,
  label,
  ...props
}: FormFieldProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <YStack>
      {label && (
        <Text htmlFor={name} fontSize={12} marginBottom={5} color="$gray11">
          {label}
        </Text>
      )}

      <Input
        value={value}
        onChangeText={onChange}
        selectionColor={'$purple'}
        borderColor={error ? '$red10Dark' : '$purple4'}
        {...props}
      />

      {error && (
        <Text fontSize={12} color="$red10Dark" marginTop={4}>
          {error.message}
        </Text>
      )}
    </YStack>
  );
};
