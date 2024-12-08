import { useQuery } from '@tanstack/react-query';
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
} from 'tamagui';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';

const fetchLowStockProducts = async () => {
  const { data, error } = await supabase.rpc('fetch_low_stock_products');
  if (error) throw new Error(error.message);
  return data;
};

export default function LowStockScreen() {
  const router = useRouter();
  const {
    data: products,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: fetchLowStockProducts,
  });

  if (isLoading)
    return (
      <YStack padding="$4">
        <Label>Carregando...</Label>
      </YStack>
    );
  if (error)
    return (
      <YStack padding="$4">
        <Label>Erro: {error.message}</Label>
      </YStack>
    );

  return (
    <YStack paddingInline="$3" flex={1} backgroundColor="$background">
      <Label fontSize={'$6'}>Produtos com Estoque Baixo</Label>
      <FlatList
        data={products}
        keyExtractor={item => item.product_code}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        ListFooterComponent={() => <Spacer size="$3" />}
        renderItem={({ item }) => (
          <ListItem
            key={item.product_code}
            padding="$3"
            borderRadius="$4"
            bordered
            hoverTheme
            pressTheme
            onPress={() => {
              router.push({
                pathname: '/(tabs)/products/[id]',
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
