import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, TextInput, Alert, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Button, ButtonText } from '@/components/ui/button';

// Função para buscar detalhes do produto
const fetchProductById = async (productId: string) => {
  const { data, error } = await supabase.from('products').select('*').eq('product_code', productId).single();
  if (error) throw new Error(error.message);
  return data;
};

// Função para buscar o preço médio
const fetchAveragePrice = async (productId: string) => {
  const { data, error } = await supabase.rpc('calculate_average_price', {
    product_code_input: productId,
  });
  if (error) throw new Error(error.message);
  return data || 0;
};

// Função para buscar o preço sugerido
const fetchSuggestedPrice = async (productId: string) => {
  const { data, error } = await supabase
    .from('suggested_prices')
    .select('price')
    .eq('product_code', productId)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  return data?.price || null;
};

// Função para atualizar os dados do produto
const updateProductDetails = async ({ productId, salePrice, minimumStock, discontinued }: { productId: string; salePrice: number; minimumStock: number; discontinued: boolean }) => {
  const { error } = await supabase.from('products').update({ sale_price: salePrice, minimum_stock: minimumStock, discontinued }).eq('product_code', productId);
  if (error) throw new Error(error.message);
};

export default function ProductEdit() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [salePrice, setSalePrice] = useState<string>('');
  const [minimumStock, setMinimumStock] = useState<string>('');
  const [discontinued, setDiscontinued] = useState<boolean>(false);

  const { data: product, error: productError, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
  });

  const { data: avgPrice, error: avgError, isLoading: avgLoading } = useQuery({
    queryKey: ['averagePrice', id],
    queryFn: () => fetchAveragePrice(id as string),
  });

  const { data: suggestedPrice, error: suggestedError, isLoading: suggestedLoading } = useQuery({
    queryKey: ['suggestedPrice', id],
    queryFn: () => fetchSuggestedPrice(id as string),
  });

  const mutation = useMutation({
    mutationFn: updateProductDetails,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Detalhes do produto atualizados com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
  });

  const handleUpdate = () => {
    const parsedPrice = parseFloat(salePrice);
    const parsedMinimumStock = parseInt(minimumStock);

    if (isNaN(parsedPrice) || isNaN(parsedMinimumStock)) {
      Alert.alert('Entrada inválida', 'Insira valores válidos para o preço e quantidade mínima.');
      return;
    }
    mutation.mutate({ productId: id as string, salePrice: parsedPrice, minimumStock: parsedMinimumStock, discontinued });
  };

  useEffect(() => {
    if (product) {
      setSalePrice(product.sale_price?.toString() || '');
      setMinimumStock(product.minimum_stock?.toString() || '');
      setDiscontinued(product.discontinued || false);
    }
  }, [product]);

  if (productLoading || avgLoading || suggestedLoading) return <Text>Loading...</Text>;
  if (productError || avgError || suggestedError) return <Text>Error: {productError?.message || avgError?.message || suggestedError?.message}</Text>;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.light.background }}>
      <Text style={{ marginBottom: 5, fontSize: 12 }}>{product.product_code}</Text>
      <Text style={{ marginBottom: 10, fontSize: 18 }}>{product.product_name}</Text>

      <Text style={{ fontSize: 16 }}>Preço atual de venda: R$ {(product.sale_price || 0).toFixed(2)}</Text>
      
      {avgPrice !== null && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{fontSize: 12, color: Colors.light.icon}}>
            Preço médio de compra: R$ {avgPrice.toFixed(2)}
          </Text>
          <Text style={{fontSize: 12, color: Colors.light.tabIconSelected}}>
            Preço de venda sugerido (
            {suggestedPrice === null 
              ? '120%' 
              : `${(((suggestedPrice - avgPrice) / avgPrice) * 100).toFixed(0)}%`}
            de lucro): R$ {suggestedPrice !== null ? suggestedPrice.toFixed(2) : (avgPrice * 2.2).toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={{ marginVertical: 20, gap: 10 }}>
        <View>
          <Text style={{color: Colors.light.icon}}>Preço de venda</Text>
          <TextInput
            placeholder="Insira o novo preço"
            value={salePrice}
            onChangeText={(text) => setSalePrice(text.replace(',', '.').replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: Colors.light.icon, padding: 10}}
          />
        </View>

        <View>
          <Text style={{color: Colors.light.icon}}>Quantidade mínima</Text>
          <TextInput
            placeholder="Quantidade mínima de estoque"
            value={minimumStock}
            onChangeText={(text) => setMinimumStock(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: Colors.light.icon, padding: 10 }}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
          <Switch
            value={discontinued}
            onValueChange={setDiscontinued}
          />
          <Text style={{ color: Colors.light.icon, marginLeft: 10 }}>Produto descontinuado</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 50 }}>
        <Button onPress={handleUpdate} action="primary" variant="solid">
          <ButtonText>Salvar</ButtonText>
        </Button>
      </View>
    </View>
  );
}