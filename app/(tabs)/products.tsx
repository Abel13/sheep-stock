import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient'; // Importando o Supabase Client do caminho correto
import { View, Text, Button, FlatList, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Product } from '@/types/Product';

// Função para buscar produtos do Supabase
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw new Error(error.message);
  return data;
};

// Função para adicionar um novo produto ao Supabase
const addProduct = async (product: Product) => {
  const { error } = await supabase.from('products').insert([product]);
  if (error) throw new Error(error.message);
};

// Função para deletar um produto no Supabase
const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('product_code', id);
  if (error) throw new Error(error.message);
};

export default function Products() {
  const queryClient = useQueryClient();

  // Manipulação de formulário com React Hook Form
  const { control, handleSubmit, reset } = useForm();
  
  // Estado para exibir/esconder o formulário de adição de produto
  const [showForm, setShowForm] = useState(false);

  // Buscando produtos com React Query
  const { data: products, error, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Mutação para adicionar um novo produto
  const mutationAdd = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refaz a consulta de produtos
      reset();
      setShowForm(false); // Esconde o formulário após a submissão
    },
  });

  // Mutação para deletar um produto
  const mutationDelete = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refaz a consulta de produtos
    },
  });

  const handleAddProduct = (data: Product) => {
    mutationAdd.mutate({
      name: data.product_name,
      average_cost_price: 0,
      sale_price: 0,
    });
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert('Confirm', 'Do you really want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => mutationDelete.mutate(id) },
    ]);
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Button title="Add New Product" onPress={() => setShowForm(!showForm)} />
      
      {showForm && (
        <View style={{ marginVertical: 20 }}>
          <Text>Add a new product</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Product Name"
                value={value}
                onChangeText={onChange}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
              />
            )}
          />
          <Controller
            control={control}
            name="average_cost_price"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Average Cost Price"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
              />
            )}
          />
          <Controller
            control={control}
            name="sale_price"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Sale Price"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
              />
            )}
          />
          <Button title="Submit" onPress={handleSubmit(handleAddProduct)} />
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item: Product) => item.product_code}
        ItemSeparatorComponent={()=><View style={{height: 5}} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderRadius: 7
            }}
          >
            <View style={{flex: 1}}>
              <Text>{item.product_name}</Text>
              {/* <Text>Cost Price: {item.average_cost_price}</Text>
              <Text>Sale Price: {item.sale_price}</Text> */}
            </View>
            <Button
              title="Delete"
              color="red"
              onPress={() => handleDeleteProduct(item.product_code)}
            />
          </View>
        )}
      />
    </View>
  );
}