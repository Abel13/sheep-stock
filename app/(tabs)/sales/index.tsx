import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

const fetchSales = async (search) => {
  let query = supabase.from('sales').select('*').order('sale_date', { ascending: false });
  if (search) {
    query = query.or(`id.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export default function Sales() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: sales, error, isLoading } = useQuery({
    queryKey: ['sales', search],
    queryFn: () => fetchSales(search),
  });

  if (isLoading && !search) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10, backgroundColor: Colors.light.background }}>
      <TextInput
        placeholder="Procure vendas por ID"
        value={search}
        onChangeText={setSearch}
        style={{ borderBottomWidth: 1, marginBottom: 20, padding: 8 }}
      />

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
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