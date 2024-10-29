import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';

const fetchSaleDetails = async (saleId) => {
  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .single();

  if (saleError) throw new Error(saleError.message);

  const { data: saleItems, error: itemsError } = await supabase
    .from('sale_products')
    .select('product_code, quantity, unit_price, total_price')
    .eq('sale_id', saleId);

  if (itemsError) throw new Error(itemsError.message);

  return { sale: saleData, items: saleItems };
};

export default function SaleDetails() {
  const { id } = useLocalSearchParams();
  const saleId = id?.toString() || '';
  const { data, error, isLoading } = useQuery(['saleDetails', saleId], () => fetchSaleDetails(saleId));

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const { sale, items } = data;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.light.background }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Detalhes da Venda</Text>
        <Text>ID da Venda: {sale.id}</Text>
        <Text>Data: {new Date(sale.sale_date).toLocaleDateString()}</Text>
        <Text>Total da Venda: R$ {sale.total_amount.toFixed(2)}</Text>
      </View>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Itens Vendidos</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product_code}
        ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: Colors.light.icon,
              borderRadius: 7,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.light.icon, fontSize: 10 }}>Código do Produto: {item.product_code}</Text>
              <Text>Quantidade: {item.quantity}</Text>
              <Text>Preço Unitário: R$ {item.unit_price.toFixed(2)}</Text>
            </View>
            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
              <Text style={{ color: Colors.light.icon, fontSize: 10 }}>Total</Text>
              <Text style={{ fontSize: 18 }}>R$ {item.total_price.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}