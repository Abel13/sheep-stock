import { useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, Pressable } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { Product } from '@/types/Product';
import { Colors } from '@/constants/Colors';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';

const fetchProducts = async (search: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('stock_quantity', 0)
      .or(`product_name.ilike.%${search}%,product_code.ilike.%${search}%`);
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    return [];
  }
};

const createSale = async ({ saleData, saleProducts }: { saleData: any; saleProducts: any[] }) => {
  const { data, error } = await supabase.from('sales').insert([saleData]).select();
  if (error) throw new Error(error.message);
  const saleId = data[0].id;

  const productsData = saleProducts.map((product) => ({
    sale_id: saleId,
    product_code: product.product_code,
    quantity: product.quantity,
    unit_price: product.unit_price,
  }));
  await supabase.from('sale_products').insert(productsData);
};

export default function SaleScreen() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts(search),
    enabled: !!search,
  });

  const handleAddProduct = (product: Product) => {
    const productExists = selectedProducts.find((p) => p.product_code === product.product_code);

    if (!productExists) {
      const productToAdd = { ...product, quantity: 1, unit_price: product.sale_price };
      setSelectedProducts((prev) => [...prev, productToAdd]);
    }

    setSearch('');
    setShowSearchResults(false);
  };

  const incrementQuantity = (productCode: string) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.product_code === productCode && product.quantity < product.stock_quantity
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
  };

  
  const decrementQuantity = (productCode: string) => {
    setSelectedProducts((prev) =>
      prev
        .map((product) =>
          product.product_code === productCode
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter((product) => product.quantity > 0)
    );
  };

  const totalAmount = selectedProducts.reduce((total, product) => total + product.unit_price * product.quantity, 0);

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setSelectedProducts([]);
      Alert.alert('Venda finalizada com sucesso!');
    },
  });

  const handleFinalizeSale = () => {
    const saleData = { total_amount: totalAmount };
    mutation.mutate({ saleData, saleProducts: selectedProducts });
  };

  return (
    <View style={{ padding: 20, backgroundColor: Colors.light.background, flex: 1 }}>
      <TextInput
        placeholder="Buscar produto por nome ou código"
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setShowSearchResults(true);
        }}
        style={{ borderBottomWidth: 1, padding: 10, marginBottom: 20 }}
      />

      {showSearchResults && search && (
        <View
          style={{
            position: 'absolute',
            top: 70, // Ajuste a posição para alinhar abaixo do campo de busca
            left: 10,
            right: 10,
            backgroundColor: Colors.light.background,
            borderWidth: 1,
            borderColor: Colors.light.icon,
            borderRadius: 4,
            maxHeight: 300,
            zIndex: 10,
          }}
        >
          {isLoading ? (
            <Text style={{ padding: 10 }}>Carregando produtos...</Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.product_code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleAddProduct(item)}
                  style={{ padding: 10, borderBottomWidth: 1, borderColor: Colors.light.icon }}
                >
                  <Text style={{fontSize: 10, color: Colors.light.icon}}>{item.product_code}</Text>
                  <Text>{item.product_name}</Text>
                  <View style={{flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', alignItems: 'flex-end'}}>
                    <Text style={{fontSize: 16}}>R$ {(item.sale_price || 0).toFixed(2)}</Text>
                    <Text style={{color: Colors.light.icon}}>Estoque: {item.stock_quantity}</Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      )}

      <Text style={{ marginTop: 20, fontSize: 18 }}>Produtos:</Text>
      <FlatList
        data={selectedProducts}
        keyExtractor={(item) => item.product_code}
        ItemSeparatorComponent={()=> <View style={{ height: 2 }} />}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderRadius: 4, gap: 10 }}>
            <View style={{ flex: 1, gap: 10 }}>
              <Text>{item.product_name}</Text>
              <Text>Total: R$ {(item.unit_price * item.quantity).toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Button onPress={() => decrementQuantity(item.product_code)}>
                <ButtonText>-</ButtonText>
              </Button>
              <Text>{item.quantity}</Text>
              <Button onPress={() => incrementQuantity(item.product_code)}>
                <ButtonText>+</ButtonText>
              </Button>
            </View>
          </View>
        )}
      />

      <Text style={{
        fontSize: 20,
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: Colors.light.tint,
        padding: 10,
        textAlign: 'center',
        color: Colors.dark.text
      }}>Total: R$ {totalAmount.toFixed(2)}</Text>

      <Button onPress={handleFinalizeSale}>
        <ButtonText>Finalizar Venda</ButtonText>
      </Button>
    </View>
  );
}