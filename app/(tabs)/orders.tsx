import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const fetchLowStockProducts = async () => {
  const { data, error } = await supabase.rpc('fetch_low_stock_products');

  if (error) throw new Error(error.message);
  return data;
};

export default function LowStockScreen() {
  const { data: products, error, isLoading } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: fetchLowStockProducts,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produtos com Estoque Baixo</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_code}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.stockInfo}>Estoque atual: {item.stock_quantity}</Text>
            <Text style={styles.stockInfo}>Estoque mínimo: {item.min_stock_quantity}</Text>
          </View>
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