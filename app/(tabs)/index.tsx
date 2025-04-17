import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Separator,
} from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { Barcode } from '@tamagui/lucide-icons';
import { FlatList, Modal } from 'react-native';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { saleSchema, SaleFormValues } from '@/schemas/saleSchema';
import { CurrencyFormField } from '@/components/molecules/FormField/CurrencyFormField';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@/components/molecules/FormField/FormField';
import { formatCurrency } from '@/utils/currency';
import { createSale } from '@/services/sale';
import { SearchField } from '@/components/molecules/SearchField';
import { ProductListItem } from '@/components/molecules/ProductListItem';
import { CartItem } from '@/components/molecules/CartItem';
import { EmptyList } from '@/components/molecules/EmptyList';
import { Feather } from '@expo/vector-icons';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { BarcodeScanningResult } from 'expo-camera';

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

export default function SaleScreen() {
  const queryClient = useQueryClient();
  const toast = useToastController();
  const theme = useTheme() || 'light';

  const [search, setSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const showSearchResults = search.length > 0;

  const { hasPermission, CameraViewComponent } = useBarcodeScanner();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts(search),
    enabled: !!search,
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(saleSchema),
    context: {
      totalAmount: selectedProducts.reduce(
        (total, product) => total + product.unit_price * product.quantity,
        0,
      ),
    },
    defaultValues: {
      customerName: '',
      valuePaid: 0,
    },
  });

  const quantity = useMemo(
    () =>
      selectedProducts.reduce(
        (total, product) => total + (product.quantity || 0),
        0,
      ),
    [selectedProducts],
  );

  const handleAddProduct = (product: Product) => {
    const productExists = selectedProducts.find(
      p => p.product_code === product.product_code,
    );

    if (!productExists) {
      const productToAdd = {
        ...product,
        quantity: 1,
        unit_price: product.sale_price || 0,
      };
      setSelectedProducts(prev => [productToAdd, ...prev]);
    }

    setSearch('');
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
      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
    },
    onError: error => {
      toast.show('Erro!', {
        message: 'Falha ao finalizar a venda!',
      });
    },
  });

  const handleFinalizeSale: SubmitHandler<SaleFormValues> = async data => {
    try {
      const saleData = {
        customer_name: data.customerName,
        value_paid: Number(data.valuePaid),
        total_amount: totalAmount,
      };

      await mutation.mutateAsync({
        saleData,
        saleProducts: selectedProducts,
      });

      reset();
      setSelectedProducts([]);
    } catch (error) {
      console.error('Erro ao finalizar a venda');
    }
  };

  const handleScanResult = (result: BarcodeScanningResult) => {
    setShowScanner(false);
    setSearch(result.data);
  };

  return (
    <YStack padding="$4" flex={1} backgroundColor="$background">
      <FormField
        control={control}
        name="customerName"
        label="Cliente"
        placeholder="Nome do cliente"
        autoCapitalize="words"
        autoCorrect={false}
      />
      <CurrencyFormField
        name="valuePaid"
        control={control}
        label="Valor pago"
      />
      <Label fontSize={'$7'} marginTop={'$3'}>
        Produtos:
      </Label>
      <XStack gap={5} flex={1}>
        <YStack width={'100%'} flex={1}>
          <SearchField
            name="search"
            placeholder="Buscar produto por nome ou código"
            value={search}
            onSearch={text => {
              setSearch(text);
            }}
          />
        </YStack>
        <Button icon={<Barcode />} onPress={() => setShowScanner(true)} />
      </XStack>
      <Spacer size={10} />
      {showSearchResults && search && (
        <YStack
          position="absolute"
          top={258}
          left={18}
          right={77}
          borderInlineWidth={1}
          borderBottomWidth={3}
          borderColor="$borderColorHover"
          backgroundColor={'$background'}
          elevation={10}
          maxHeight={'65%'}
          zIndex={100}
        >
          <FlatList
            data={products}
            keyExtractor={item => item.product_code}
            refreshing={isLoading}
            renderItem={({ item }) => (
              <ProductListItem item={item} onPress={handleAddProduct} />
            )}
            ListEmptyComponent={
              <EmptyList
                icon="search"
                title="Nenhum produto encontrado"
                message="Tente buscar com outro termo"
              />
            }
            ItemSeparatorComponent={() => <Separator height={2} />}
            getItemLayout={(data, index) => ({
              length: 100,
              offset: 100 * index,
              index,
            })}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </YStack>
      )}
      <FlatList
        data={selectedProducts}
        keyExtractor={item => item.product_code!}
        ItemSeparatorComponent={() => <Spacer size={5} />}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
          />
        )}
        ListEmptyComponent={
          <EmptyList
            icon="shopping-cart"
            title="Nenhum produto adicionado"
            message="Adicione produtos ao carrinho"
          />
        }
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      <Spacer size={10} />
      <Card padding="$2" bordered radiused gap={10}>
        <XStack justifyContent="space-between">
          <Text color="$color10">Total de itens:</Text>
          <Text color="$color10">{quantity}</Text>
        </XStack>

        <Text fontSize="$5" textAlign="right">
          Total: {formatCurrency(totalAmount)}
        </Text>

        <Button
          onPress={handleSubmit(handleFinalizeSale)}
          disabled={isSubmitting || !allowFinish}
          theme={isSubmitting || !allowFinish ? 'gray_active' : 'active'}
        >
          {isSubmitting ? 'Finalizando...' : 'Finalizar Venda'}
        </Button>
      </Card>

      <Modal visible={showScanner} animationType="fade">
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="flex-start"
          paddingTop="$11"
          backgroundColor={'$background'}
        >
          <Button
            onPress={() => setShowScanner(false)}
            marginBottom="$15"
            circular
            alignSelf="flex-end"
            marginRight={'$4'}
          >
            <Feather name="x" size={24} color={theme.color10?.val} />
          </Button>
          <CameraViewComponent
            style={{ width: '100%', height: 100 }}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'qr', 'code128'],
            }}
            onBarcodeScanned={handleScanResult}
          />
        </YStack>
      </Modal>
    </YStack>
  );
}
