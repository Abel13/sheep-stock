import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, SectionList, TextInput, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

const fetchSales = async () => {
  let query = supabase.from('sales').select('*').order('sale_date', { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Função para agrupar vendas por data
const groupSalesByDate = (sales) => {
  const groupedSales = sales.reduce((acc, sale) => {
    const saleDate = new Date(sale.sale_date).toLocaleDateString();
    if (!acc[saleDate]) {
      acc[saleDate] = [];
    }
    acc[saleDate].push(sale);
    return acc;
  }, {});

  return Object.keys(groupedSales).map((date) => ({
    title: date,
    data: groupedSales[date],
  }));
};

export default function Sales() {
  const router = useRouter();

  const { data: sales, error, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => fetchSales(),
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const groupedSales = groupSalesByDate(sales || []);

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10, backgroundColor: Colors.light.background }}>
      <SectionList
        sections={groupedSales}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={{ fontSize: 16, color: Colors.light.tint, fontWeight: 'bold', paddingVertical: 10, backgroundColor: Colors.light.background }}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({
              pathname: '/(tabs)/sales/[id]',
              params: {
                id: item.id
              }
            })}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: Colors.light.icon,
              borderRadius: 7,
              marginBottom: 5,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.light.icon, fontSize: 10, marginBottom: 5 }}>ID: {item.id}</Text>
              <Text>Data: {new Date(item.sale_date).toLocaleDateString()}</Text>
              <View style={{ marginTop: 10 }}>
                <Text>Total: R$ {(item.total_amount || 0).toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
              <Text style={{ color: Colors.light.icon, fontSize: 10, marginBottom: 5 }}>TOTAL</Text>
              <Text style={{ fontSize: 20 }}>R$ {item.total_amount.toFixed(2)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}