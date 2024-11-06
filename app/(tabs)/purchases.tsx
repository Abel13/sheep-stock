import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useEffect } from 'react';

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
  if (isLoading) return <ActivityIndicator size="large" color={Colors.light.icon} />;
  if (error) return <Text>Error: {error.message}</Text>;

  // Renderiza cada item da lista
  const renderOrderItem = ({ item }: { item: { supplier: string; total_value: number; total_items: number; purchase_date: string } }) => (
    <View style={{
      padding: 15,
      backgroundColor: Colors.light.background,
      marginVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.light.icon
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.supplier}</Text>
      <View style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
        <Text style={{fontSize: 10}}>{new Date(item.purchase_date).toLocaleDateString()}</Text>
        <Text style={{fontSize: 10}}>{item.total_items} itens</Text>
      </View>
      <Text style={{textAlign: 'right', fontSize: 22, fontWeight: '500'}}>R$ {item.total_value.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.light.background }}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}