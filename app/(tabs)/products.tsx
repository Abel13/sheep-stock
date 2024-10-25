import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient'; // Importando o Supabase Client do caminho correto
import { View, Text, FlatList, TextInput, Alert, Pressable } from 'react-native';
import { Product } from '@/types/Product';
import { Colors } from '@/constants/Colors';
import { Center } from '@/components/ui/center';
import { useRouter } from 'expo-router';

const fetchProducts = async (search: string) => {
  let query = supabase.from('products').select('*').order('product_name');
  if (search) {
    query = query.or(`product_name.ilike.%${search}%,product_code.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export default function Products() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: products, error, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts(search),
  });

  if (isLoading && !search) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={{ flex:1, paddingHorizontal: 20, paddingTop: 10, backgroundColor: Colors.light.background }}>
      <TextInput
        placeholder="Procure itens por nome ou código"
        value={search}
        onChangeText={setSearch}
        style={{ borderBottomWidth: 1, marginBottom: 20, padding: 8 }}
      />

      <FlatList
        data={products}
        keyExtractor={(item: Product) => item.product_code}
        ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({
              pathname: `/product/[id]`,
              params: {
                  id: item.product_code
                }
              })
            }
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
              <Text style={{color: Colors.light.icon, fontSize: 10, marginBottom: 5}}>{item.product_code}</Text>
              <Text>{item.product_name}</Text>
              <View style={{borderWidth: 1, padding: 2, marginTop: 5}}>
                <Text>Preço de venda: R$ {(item.sale_price || 0).toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
              <Text style={{color: Colors.light.icon, fontSize: 10, marginBottom: 5}}>ESTOQUE</Text>
              <Text style={{fontSize: 30}}>{item.stock_quantity}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}