import { memo } from 'react';
import { ListItem, Text, YStack } from 'tamagui';
import { Product } from '@/types/Product';

interface ProductListItemProps {
  item: Product;
  onPress: (product: Product) => void;
}

export const ProductListItem = memo(
  ({ item, onPress }: ProductListItemProps) => (
    <ListItem
      key={item.product_code}
      onPress={() => onPress(item)}
      paddingHorizontal="$3"
      paddingVertical="$2"
      justifyContent="space-between"
      gap="$2"
      radiused
      hoverTheme
      pressTheme
    >
      <YStack flex={1}>
        <Text fontWeight="400" fontSize={10} color={'gray'}>
          {item.product_code}
        </Text>
        <Text fontWeight="500">{item.product_name}</Text>
        <Text marginTop="$2">
          Preço de venda: {(item.sale_price || 0).toFixed(2)}
        </Text>
      </YStack>
      <YStack justifyContent="center" alignItems="center">
        <Text fontWeight={'300'} fontSize={12}>
          ESTOQUE
        </Text>
        <Text fontSize={22} fontWeight={'500'}>
          {item.stock_quantity}
        </Text>
      </YStack>
    </ListItem>
  ),
);
