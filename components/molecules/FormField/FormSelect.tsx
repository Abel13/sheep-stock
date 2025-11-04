import { Text, YStack, SelectProps, Select, Adapt, Sheet } from 'tamagui';
import { Control, useController } from 'react-hook-form';
import { ChevronDown } from '@tamagui/lucide-icons';

type Option = { value: string; label: string };

interface FormSelectProps
  extends Omit<SelectProps, 'children' | 'onValueChange' | 'value'> {
  name: string;
  control: Control<any>;
  label?: string;
  options?: Option[];
  placeholder?: string;
}

export const FormSelect = ({
  name,
  control,
  label,
  options = [],
  placeholder = 'Selecione...',
  ...props
}: FormSelectProps) => {
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

      <Select
        value={value}
        onValueChange={onChange}
        disablePreventBodyScroll
        {...props}
      >
        <Select.Trigger
          iconAfter={ChevronDown}
          borderColor={error ? '$red10Dark' : '$purple4'}
        >
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>

        <Adapt platform="touch">
          <Sheet modal dismissOnSnapToBottom>
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay backgroundColor="$shadowColor" />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton />
          <Select.Viewport minWidth={200}>
            <Select.Group>
              {label && <Select.Label>{label}</Select.Label>}
              {options.map((opt, index) => (
                <Select.Item key={opt.value} value={opt.value} index={index}>
                  <Select.ItemText>{opt.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>

      {error && (
        <Text fontSize={12} color="$red10Dark" marginTop={4}>
          {error.message}
        </Text>
      )}
    </YStack>
  );
};
