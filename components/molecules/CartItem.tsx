import { memo } from 'react';
import { ListItem, Text, XStack, YStack, Button } from 'tamagui';
import { formatCurrency } from '@/utils/currency';

interface CartItemProps {
  item: any;
  onIncrement: (code: string) => void;
  onDecrement: (code: string) => void;
}

export const CartItem = memo(
  ({ item, onIncrement, onDecrement }: CartItemProps) => (
    <ListItem
      key={item.product_code}
      borderWidth={1}
      radiused
      padding="$3"
      gap="$1"
    >
      <YStack flex={1} gap="$2">
        <Text>{item.product_name}</Text>
        <Text>Total: {formatCurrency(item.unit_price * item.quantity)}</Text>
      </YStack>
      <XStack gap="$2" alignItems="center">
        <Button onPress={() => onDecrement(item.product_code!)}>-</Button>
        <Text>{item.quantity.toString().padStart(2, '0')}</Text>
        <Button onPress={() => onIncrement(item.product_code!)}>+</Button>
      </XStack>
    </ListItem>
  ),
);
