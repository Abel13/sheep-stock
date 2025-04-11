import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { Product } from '@/types/Product';
import {
  YStack,
  XStack,
  Button,
  Input,
  Text,
  ListItem,
  Spacer,
  Label,
  Card,
  useTheme,
} from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

const fetchProducts = async (search: string): Promise<Product[]> => {
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

const createSale = async ({
  saleData,
  saleProducts,
}: {
  saleData: any;
  saleProducts: any[];
}) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([saleData])
    .select();
  if (error) throw new Error(error.message);
  const saleId = data[0].id;

  const productsData = saleProducts.map(product => ({
    sale_id: saleId,
    product_code: product.product_code,
    quantity: product.quantity,
    unit_price: product.unit_price,
  }));
  await supabase.from('sale_products').insert(productsData);
};

export default function SaleScreen() {
  const queryClient = useQueryClient();
  const toast = useToastController();
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState('');
  const [valuePaid, setValuePaid] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts(search),
    enabled: !!search,
  });

  const handleAddProduct = (product: Product) => {
    const productExists = selectedProducts.find(
      p => p.product_code === product.product_code,
    );

    if (!productExists) {
      const productToAdd = {
        ...product,
        quantity: 1,
        unit_price: product.sale_price,
      };
      setSelectedProducts(prev => [...prev, productToAdd]);
    }

    setSearch('');
    setShowSearchResults(false);
  };

  const incrementQuantity = (productCode: string) => {
    setSelectedProducts(prev =>
      prev.map(product =>
        product.product_code === productCode &&
        product.quantity < product.stock_quantity
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      ),
    );
  };

  const decrementQuantity = (productCode: string) => {
    setSelectedProducts(prev =>
      prev
        .map(product =>
          product.product_code === productCode
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        )
        .filter(product => product.quantity > 0),
    );
  };

  const totalAmount = selectedProducts.reduce(
    (total, product) => total + product.unit_price * product.quantity,
    0,
  );
  const allowFinish = selectedProducts.length > 0;

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products_list', ''] });
      setSelectedProducts([]);
      setCustomer('');
      setValuePaid('');
      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
    },
    onError: error => {
      toast.show('Erro!', {
        message: 'Falha ao finalizar a venda!',
      });
      console.log(error);
    },
  });

  const handleFinalizeSale = () => {
    const saleData = {
      total_amount: totalAmount,
      customer_name: customer,
      value_paid: valuePaid,
    };
    mutation.mutate({ saleData, saleProducts: selectedProducts });
  };

  return (
    <YStack padding="$4" flex={1} backgroundColor="$background">
      <Text htmlFor="customer" fontSize={12} marginBottom={5}>
        Cliente
      </Text>
      <Input
        placeholder="Nome do cliente"
        value={customer}
        onChangeText={setCustomer}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
      />
      <Spacer size={10} />
      <Text htmlFor="customer" fontSize={12} marginBottom={5}>
        Valor pago
      </Text>
      <Input
        placeholder="Valor pago"
        value={valuePaid}
        onChangeText={setValuePaid}
        keyboardType="numeric"
        autoCorrect={false}
        returnKeyType="next"
      />
      <Label fontSize={'$7'} marginTop={'$3'}>
        Produtos:
      </Label>
      <Input
        placeholder="Buscar produto por nome ou código"
        value={search}
        autoCapitalize="characters"
        autoCorrect={false}
        onChangeText={text => {
          setSearch(text);
          setShowSearchResults(true);
        }}
      />
      <Spacer size={10} />
      {showSearchResults && search && (
        <YStack
          position="absolute"
          top={250}
          left={18}
          right={18}
          borderWidth={1}
          backgroundColor={'$borderColor'}
          borderColor="$borderColor"
          maxHeight={300}
          zIndex={10}
        >
          {isLoading ? (
            <Text paddingVertical="$2" paddingHorizontal="$2">
              Carregando produtos...
            </Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={item => item.product_code}
              renderItem={({ item }) => (
                <ListItem
                  key={item.product_code}
                  onPress={() => handleAddProduct(item)}
                  borderBottomWidth={1}
                  borderColor="$borderColor"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  justifyContent="space-between"
                  gap="$2"
                  hoverTheme
                  pressTheme
                >
                  <YStack flex={1}>
                    <Text fontWeight="400" fontSize={10} color={'gray'}>
                      {item.product_code}
                    </Text>
                    <Text fontWeight="500">{item.product_name}</Text>
                    <Text marginTop="$2">
                      Preço de venda: R$ {(item.sale_price || 0).toFixed(2)}
                    </Text>
                  </YStack>
                  <YStack justifyContent="center" alignItems="center">
                    <Text fontWeight={'300'} fontSize={12}>
                      ESTOQUE
                    </Text>
                    <Text fontSize={22} fontWeight={'500'}>
                      {item.stock_quantity}
                    </Text>
                  </YStack>
                </ListItem>
              )}
            />
          )}
        </YStack>
      )}
      <FlatList
        data={selectedProducts}
        keyExtractor={item => item.product_code}
        ItemSeparatorComponent={() => <Spacer size={5} />}
        ListEmptyComponent={() => (
          <Card
            justifyContent="center"
            alignItems="center"
            padding={20}
            bordered
          >
            <Feather
              name="shopping-cart"
              size={24}
              color={theme.color9.get()}
            />
            <Label>Nenhum produto adicionado.</Label>
          </Card>
        )}
        renderItem={({ item }) => (
          <ListItem
            key={item.product_code}
            borderWidth={1}
            radiused
            padding="$3"
            gap="$1"
          >
            <YStack flex={1} gap="$2">
              <Text>{item.product_name}</Text>
              <Text>
                Total: R$ {(item.unit_price * item.quantity).toFixed(2)}
              </Text>
            </YStack>
            <XStack gap="$2" alignItems="center">
              <Button onPress={() => decrementQuantity(item.product_code)}>
                -
              </Button>
              <Text>{item.quantity.toString().padStart(2, '0')}</Text>
              <Button onPress={() => incrementQuantity(item.product_code)}>
                +
              </Button>
            </XStack>
          </ListItem>
        )}
      />

      <Card padding="$2" bordered radiused>
        <Label fontSize="$8" textAlign="right">
          Total: R$ {totalAmount.toFixed(2)}
        </Label>

        <Button
          onPress={handleFinalizeSale}
          disabled={!allowFinish}
          theme={allowFinish ? 'active' : 'gray'}
        >
          Finalizar Venda
        </Button>
      </Card>
    </YStack>
  );
}
