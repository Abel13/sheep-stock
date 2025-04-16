import { Input, InputProps, Text, XStack } from 'tamagui';
import { forwardRef } from 'react';
import { TextInput } from 'react-native';
import { formatCurrency, parseCurrency } from '@/utils/currency';

export interface CurrencyInputProps
  extends Omit<InputProps, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  label?: string;
}

export const CurrencyInput = forwardRef<TextInput, CurrencyInputProps>(
  ({ value, onChange, error, label, ...props }, ref) => {
    const displayValue = value
      ? formatCurrency(Number(value).toFixed(2))
      : formatCurrency(0);

    const handleChangeText = (text: string) => {
      const numbers = parseCurrency(text.replace(/\D/g, ''));
      onChange?.(numbers);
    };

    return (
      <XStack flexDirection="column" width="100%">
        {label && (
          <Text
            htmlFor={props.id}
            fontSize={12}
            marginBottom={5}
            color="$gray11"
          >
            {label}
          </Text>
        )}

        <Input
          ref={ref}
          {...props}
          value={displayValue}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          placeholder="R$ 0,00"
          selectionColor={'$purple'}
          borderColor={error ? '$red8Dark' : '$purple4'}
        />

        {error && (
          <Text fontSize={12} color="$red10Dark" marginTop={4}>
            {error}
          </Text>
        )}
      </XStack>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
