import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import {
  YStack,
  XStack,
  ListItem,
  Label,
  Button,
  Spacer,
  Card,
  Text,
  Spinner,
  VisuallyHidden,
} from 'tamagui';
import { useRouter } from 'expo-router';
import { FlatList, RefreshControl } from 'react-native';
import { Loading } from '@/components/molecules/Loading';

const fetchLowStockProducts = async () => {
  const { data, error } = await supabase
    .rpc('fetch_low_stock_products')
    .order('product_name');
  if (error) throw new Error(error.message);
  return data;
};

export default function LowStockScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: products,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['low_stock_products'],
    queryFn: fetchLowStockProducts,
  });

  if (error)
    return (
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Label>Erro: {error.message}</Label>
      </YStack>
    );

  return (
    <YStack paddingInline="$3" flex={1} backgroundColor="$background">
      <FlatList
        data={products}
        keyExtractor={item => item.product_code}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        ListHeaderComponent={() => <Spacer size={'$3'} />}
        ListFooterComponent={() => <Spacer size="$3" />}
        renderItem={({ item }) => (
          <ListItem
            key={item.product_code}
            padding="$3"
            borderRadius="$4"
            bordered
            hoverTheme
            pressTheme
            radiused
            onPress={() => {
              router.navigate({
                pathname: '/(drawer)/products/[id]',
                params: { id: item.product_code },
              });
            }}
          >
            <YStack flex={1}>
              <Text>{item.product_name}</Text>
              <XStack justifyContent="space-between" alignItems="center">
                <Label fontSize="$2" color="gray">
                  Estoque atual: {item.stock_quantity}
                </Label>
                <Label fontSize="$2" color="gray">
                  Estoque mínimo: {item.minimum_stock}
                </Label>
              </XStack>
            </YStack>
          </ListItem>
        )}
        ItemSeparatorComponent={() => <Spacer size="$2" />}
        ListEmptyComponent={() => (
          <Card
            justifyContent="center"
            alignItems="center"
            padding="$4"
            bordered
          >
            <Label>Todos os produtos estão com estoque acima do mínimo.</Label>
          </Card>
        )}
      />
    </YStack>
  );
}
