import { useState, memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { FlatList, RefreshControl } from 'react-native';
import { Product } from '@/types/Product';
import { useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Spacer,
  Input,
  Image,
} from 'tamagui';

// Função para buscar produtos
const fetchProducts = async (search: string) => {
  let query = supabase
    .from('products')
    .select('*')
    .neq('stock_quantity', 0)
    .order('product_name');
  if (search) {
    query = query.or(
      `product_name.ilike.%${search}%,product_code.ilike.%${search}%`,
    );
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Componente de item para a lista, otimizado com React.memo
const ProductItem = memo(
  ({ item, onPress }: { item: Product; onPress: (code: string) => void }) => (
    <Card
      onPress={() => onPress(item.product_code)}
      padding="$3"
      bordered
      borderRadius="$4"
      backgroundColor="$background"
      hoverTheme
      pressTheme
    >
      <XStack gap="$3" alignItems="center">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            width={50}
            height={50}
            borderRadius="$4"
            borderWidth={1}
            borderColor={'$borderColor'}
          />
        ) : (
          <XStack
            width={50}
            height={50}
            borderWidth={2}
            borderColor={'$borderColor'}
            backgroundColor={'$background075'}
            borderRadius={8}
          />
        )}
        <YStack flex={1}>
          <Text color="$color" fontSize={8} marginBottom="$1">
            {item.product_code}
          </Text>
          <Text fontSize="$3" fontWeight="500">
            {item.product_name}
          </Text>
          <Text marginTop="$3" fontSize="$3">
            Preço de venda: R$ {(item.sale_price || 0).toFixed(2)}
          </Text>
        </YStack>
        <YStack alignItems="center" justifyContent="center">
          <Text fontSize="$2" color="$color" fontWeight="300">
            ESTOQUE
          </Text>
          <Text fontSize="$7">{item.stock_quantity}</Text>
        </YStack>
      </XStack>
    </Card>
  ),
);

export default function Products() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const {
    data: products,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['products_list', search],
    queryFn: () => fetchProducts(search),
  });

  const handlePress = (productCode: string) => {
    setSearch('');
    router.push({
      pathname: `/products/[id]`,
      params: { id: productCode },
    });
  };

  if (error)
    return (
      <YStack padding="$4">
        <Text color="$red10">Error: {error.message}</Text>
      </YStack>
    );

  return (
    <YStack
      flex={1}
      paddingHorizontal="$4"
      paddingTop="$2"
      backgroundColor="$background"
    >
      <Input
        placeholder="Procure itens por nome ou código"
        value={search}
        onChangeText={setSearch}
        borderBottomWidth="$0.5"
        paddingVertical="$3"
        marginBottom="$4"
      />

      <FlatList
        data={products}
        keyExtractor={(item: Product) => item.product_code}
        refreshControl={<RefreshControl refreshing={isLoading} />}
        onRefresh={() => {
          queryClient.invalidateQueries({
            queryKey: ['products_list', search],
          });
        }}
        refreshing={isLoading}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        ItemSeparatorComponent={() => <Spacer size="$2" />}
        renderItem={({ item }) => (
          <ProductItem item={item} onPress={handlePress} />
        )}
      />
    </YStack>
  );
}
