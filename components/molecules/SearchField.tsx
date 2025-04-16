import { Input, InputProps, YStack } from 'tamagui';

interface SearchFieldProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  name: string;
  label?: string;
  value?: string;
  onSearch?: (value: string) => void;
}

export const SearchField = ({
  name,
  value,
  label,
  onSearch,
  ...props
}: SearchFieldProps) => {
  return (
    <YStack>
      <Input
        value={value}
        onChangeText={onSearch}
        autoCapitalize="characters"
        autoCorrect={false}
        selectionColor={'$purple'}
        borderColor={'$purple4'}
        {...props}
      />
    </YStack>
  );
};
