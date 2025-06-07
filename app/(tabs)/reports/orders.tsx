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
  Spinner,
} from 'tamagui';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
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
      <YStack
        flex={1}
        padding="$4"
        paddingTop="$10"
        backgroundColor="$background"
        alignItems="center"
        gap={10}
      >
        <Loading message="Carregando produtos..." />
      </YStack>
    );
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
