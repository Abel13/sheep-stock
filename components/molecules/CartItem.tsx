import { memo } from 'react';
import { ListItem, Text, XStack, YStack, Button } from 'tamagui';
import { convertNumberToLocaleString, formatCurrency } from '@/utils/number';
import { ItemSale } from '@/types/ItemSale';
import { Feather } from '@expo/vector-icons';
import { Trash2 } from '@tamagui/lucide-icons';

interface CartItemProps {
  item: ItemSale;
  onIncrement: (code: string) => void;
  onDecrement: (code: string) => void;
}

export const CartItem = memo(
  ({ item, onIncrement, onDecrement }: CartItemProps) => (
    <ListItem key={item.code} borderWidth={1} radiused padding="$3" gap="$1">
      <YStack flex={1} gap="$2" marginRight={'$2'}>
        <Text>{item.name}</Text>
        <Text>
          Total:{' '}
          {convertNumberToLocaleString({
            value: item.price * item.quantity,
            type: 'currency',
          })}
        </Text>
      </YStack>
      <XStack gap="$2" alignItems="center">
        <Button onPress={() => onDecrement(item.code!)}>
          {item.quantity === 1 && (
            <Button.Icon>
              <Trash2 />
            </Button.Icon>
          )}
          {item.quantity > 1 && (
            <Button.Text fontSize={'$5'} paddingHorizontal={'$1.5'}>
              -
            </Button.Text>
          )}
        </Button>
        <Text>{item.quantity.toString().padStart(2, '0')}</Text>
        <Button onPress={() => onIncrement(item.code!)}>
          <Button.Text fontSize={'$5'} paddingHorizontal={'$1.5'}>
            +
          </Button.Text>
        </Button>
      </XStack>
    </ListItem>
  ),
);
