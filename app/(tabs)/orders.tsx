import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

const fetchLowStockProducts = async () => {
  const { data, error } = await supabase.rpc('fetch_low_stock_products');

  if (error) throw new Error(error.message);
  return data;
};

export default function LowStockScreen() {
  const router = useRouter();
  const { data: products, error, isLoading } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: fetchLowStockProducts,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_code}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={(data, index) => (
          { length: 80, offset: 80 * index, index }
        )}
        renderItem={({ item }) => (
          <Pressable style={styles.itemContainer} onPress={() => {
            router.push({
              pathname: '/(tabs)/products/[id]',
              params: {
                id: item.product_code
              }
            })
          }}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.stockInfo}>Estoque atual: {item.stock_quantity}</Text>
            <Text style={styles.stockInfo}>Estoque mínimo: {item.min_stock_quantity}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockInfo: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  separator: {
    height: 10,
  },
});