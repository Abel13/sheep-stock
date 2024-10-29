import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { View, Text, TextInput, Alert } from 'react-native';
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
  return data || 0; // Retorna 0 se não houver dados
};

// Função para buscar o preço sugerido
const fetchSuggestedPrice = async (productId: string) => {
  const { data, error } = await supabase.from('suggested_price').select('price').eq('product_code', productId).single();
  if (error) throw new Error(error.message);
  return data ? data.price : null;
};

// Função para atualizar o preço de venda do produto
const updateProductSalePrice = async ({ productId, salePrice }: { productId: string; salePrice: number }) => {
  const { error } = await supabase.from('products').update({ sale_price: salePrice }).eq('product_code', productId);
  if (error) throw new Error(error.message);
};

export default function ProductEdit() {
  const { id } = useLocalSearchParams(); // Pega o ID da URL
  const router = useRouter();
  
  const [salePrice, setSalePrice] = useState<string>('');
  
  // Buscar dados do produto
  const { data: product, error: productError, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
  });

  // Buscar o preço médio
  const { data: avgPrice, error: avgError, isLoading: avgLoading } = useQuery({
    queryKey: ['averagePrice', id],
    queryFn: () => fetchAveragePrice(id as string),
  });

  // Buscar o preço sugerido
  const { data: suggestedPrice, error: suggestedError, isLoading: suggestedLoading } = useQuery({
    queryKey: ['suggestedPrice', id],
    queryFn: () => fetchSuggestedPrice(id as string),
  });

  // Mutação para atualizar o preço de venda
  const mutation = useMutation({
    mutationFn: updateProductSalePrice,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Preço de venda atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.push('/products') },
      ]);
    },
  });

  const handleChange = (text: string) => {
    const formattedText = text.replace(',', '.').replace(/[^0-9.]/g, '');
    setSalePrice(formattedText);
  };

  const handleUpdate = () => {
    const parsedPrice = parseFloat(salePrice);

    if (isNaN(parsedPrice)) {
      Alert.alert('Entrada inválida', 'Insira um número válido para o preço de venda.');
      return;
    }
    mutation.mutate({ productId: id as string, salePrice: parsedPrice });
  };

  if (productLoading || avgLoading || suggestedLoading) return <Text>Loading...</Text>;
  if (productError || avgError || suggestedError) return <Text>Error: {productError?.message || avgError?.message || suggestedError?.message}</Text>;

  // Calculo do preço sugerido: usar o preço sugerido da tabela ou aplicar a lógica de 120%
  const calculatedSuggestedPrice = suggestedPrice !== null 
    ? suggestedPrice 
    : avgPrice !== null 
      ? avgPrice * 2.2 // 120% de lucro
      : 0;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.light.background }}>
      <Text style={{ marginBottom: 5, fontSize: 12 }}>{product.product_code}</Text>
      <Text style={{ marginBottom: 10, fontSize: 18 }}>{product.product_name}</Text>

      <Text style={{fontSize: 16}}>Preço atual de venda: R$ {(product.sale_price || 0).toFixed(2)}</Text>
      
      {avgPrice !== null && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{fontSize: 12, color: Colors.light.icon}}>Preço médio de compra: R$ {avgPrice.toFixed(2)}</Text>
          <Text style={{fontSize: 12, color: Colors.light.tabIconSelected}}>
            Preço de venda sugerido: R$ {calculatedSuggestedPrice.toFixed(2)}
          </Text>
        </View>
      )}
      
      <TextInput
        placeholder="Insira o novo preço"
        value={salePrice}
        onChangeText={handleChange}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: Colors.light.icon, padding: 10, marginVertical: 20 }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 50 }}>
        <Button onPress={() => router.navigate('/(tabs)/products')} action="negative" variant="link">
          <ButtonText>Cancelar</ButtonText>
        </Button>
        <Button onPress={handleUpdate} action="primary" variant="solid">
          <ButtonText>Salvar</ButtonText>
        </Button>
      </View>
    </View>
  );
}