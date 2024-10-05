// app/products.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

// Fetch products from Supabase
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export default function Products() {
  const { data, error, isLoading } = useQuery(['products'], fetchProducts);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <ScrollView>
      {data?.map(product => (
        <Box
          key={product.id}
          padding="4"
          backgroundColor="white"
          marginBottom="2"
        >
          <Text fontSize="xl" fontWeight="bold">
            {product.name}
          </Text>
          <Text>Price: {product.sale_price}</Text>
        </Box>
      ))}
    </ScrollView>
  );
}
