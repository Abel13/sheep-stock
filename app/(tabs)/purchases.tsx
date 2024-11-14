import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { YStack, Text, Card, ListItem, Spacer, Spinner, XStack } from 'tamagui';
import { FlatList } from 'react-native';

// Função para buscar ordens de compra
const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('supplier, total_value, total_items, purchase_date');
  
  if (error) throw new Error(error.message);
  return data;
};

export default function OrderList() {
  const { data: orders, error, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  // Exibe uma mensagem de carregamento ou erro
  if (isLoading) return <YStack flex={1} justifyContent="center" alignItems="center"><Spinner size="large" /></YStack>;
  if (error) return <YStack padding="$4"><Text color="$red10">Erro: {error.message}</Text></YStack>;

  return (
    <YStack padding="$4" flex={1} backgroundColor="$background">
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ListItem
            padding="$3"
            bordered
            radiused
            hoverTheme
            pressTheme
          >
            <YStack flex={1} gap='$2'>
              <Text fontSize="$4" fontWeight="600">{item.supplier}</Text>
              <XStack gap="$2">
                <Text fontSize={10} color="$color10">
                  {new Date(item.purchase_date).toLocaleDateString()}
                </Text>
                <Text fontSize={10} color="$color10">
                  {item.total_items} itens
                </Text>
              </XStack>
              <Text textAlign="right" fontSize="$5" fontWeight="300">
                R$ {item.total_value.toFixed(2)}
              </Text>
            </YStack>
          </ListItem>
        )}
        ItemSeparatorComponent={() => <Spacer size="$3" />}
      />
    </YStack>
  );
}