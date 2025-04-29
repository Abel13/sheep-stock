import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import {
  YStack,
  Text,
  ListItem,
  Spacer,
  Spinner,
  XStack,
  Button,
} from 'tamagui';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { formatCurrency } from '@/utils/currency';

const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('supplier, total_value, total_items, purchase_date');

  if (error) throw new Error(error.message);
  return data;
};

export default function OrderList() {
  const router = useRouter();
  const {
    data: orders,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  // Exibe uma mensagem de carregamento ou erro
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
        <Spinner size="large" color="$lavender" />
        <Text>Carregando pedidos...</Text>
      </YStack>
    );
  if (error)
    return (
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Text color="$red10">Erro: {error.message}</Text>
      </YStack>
    );

  return (
    <YStack padding="$4" flex={1} backgroundColor="$background">
      <Button
        marginBottom={'$4'}
        onPress={() => router.push({ pathname: '/(tabs)/purchases/add' })}
      >
        Novo Pedido
      </Button>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ListItem padding="$3" bordered radiused hoverTheme pressTheme>
            <YStack flex={1} gap="$2">
              <Text fontSize="$3" fontWeight="600">
                {item.supplier}
              </Text>
              <XStack gap="$2">
                <Text fontSize={10} color="$color10">
                  {new Date(item.purchase_date!).toLocaleDateString()}
                </Text>
                <Text fontSize={10} color="$color10">
                  {item.total_items} itens
                </Text>
              </XStack>
              <Text textAlign="right" fontSize="$5" fontWeight="300">
                {formatCurrency(item.total_value || 0)}
              </Text>
            </YStack>
          </ListItem>
        )}
        ItemSeparatorComponent={() => <Spacer size="$3" />}
      />
    </YStack>
  );
}
