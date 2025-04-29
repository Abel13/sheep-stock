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
import { Barcode, Printer, Share, Share2 } from '@tamagui/lucide-icons';
import { FlatList, Modal } from 'react-native';
import { get, useForm, type SubmitHandler } from 'react-hook-form';
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
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

interface SaleProduct {
  unit_price: number;
  quantity: number;
  product_code: string;
  stock_quantity: number;
  average_cost: number | null;
  discontinued: boolean | null;
  image_url: string | null;
  min_stock_quantity: number | null;
  minimum_stock: number | null;
  product_name: string | null;
  sale_price: number | null;
}

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
  const [showShare, setShowShare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SaleProduct[]>([]);
  const showSearchResults = search.length > 0;

  const { hasPermission, CameraViewComponent } = useBarcodeScanner();

  const [selectedPrinter, setSelectedPrinter] = useState();

  const printToFile = async () => {
    const { uri } = await Print.printToFileAsync({ html });
    console.log('File has been saved to:', uri);
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts(search),
    enabled: !!search,
  });

  const {
    control,
    handleSubmit,
    getValues,
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

  const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    </head>
    <body style="text-align: center;">
      <img
        src="https://d30j33t1r58ioz.cloudfront.net/static/guides/sdk.png"
        style="width: 90vw;"
      />
      <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
        ${getValues('customerName')}
      </h1>
    </body>
  </html>
  `;

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
        stock_quantity: product.stock_quantity || 0,
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

  const handleShare = useCallback(() => {}, []);

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
      <XStack gap={5}>
        <YStack width={'100%'} flex={1}>
          <SearchField
            name="search"
            placeholder="Nome ou código do produto"
            value={search}
            onSearch={text => {
              setSearch(text);
            }}
          />
        </YStack>
        <Button onPress={() => setShowScanner(true)}>
          <Button.Icon>
            <Barcode />
          </Button.Icon>
        </Button>
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
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap={10}>
            <Text color="$color10">Total de itens:</Text>
            <Text color="$color10">{quantity}</Text>
          </XStack>
          <Button onPress={() => setShowShare(true)} disabled={quantity === 0}>
            <Button.Icon>
              <Share2 />
            </Button.Icon>
          </Button>
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
          {hasPermission ? (
            <CameraViewComponent
              style={{ width: '100%', height: 100 }}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13'],
              }}
              onBarcodeScanned={handleScanResult}
            />
          ) : (
            <Text>Permissão não concedida!</Text>
          )}
        </YStack>
      </Modal>

      <Modal visible={showShare} animationType="fade">
        <YStack
          flex={1}
          justifyContent="flex-start"
          padding={'$2'}
          paddingTop="$11"
          gap={10}
          backgroundColor={'$background'}
        >
          <Button
            onPress={() => setShowShare(false)}
            marginBottom="$2"
            circular
            alignSelf="flex-end"
            marginRight={'$4'}
          >
            <Feather name="x" size={24} color={theme.color10?.val} />
          </Button>
          <Text marginBottom={'$2'}>{getValues('customerName') || '--'}</Text>
          <FlatList
            data={selectedProducts}
            keyExtractor={item => item.product_code!}
            ItemSeparatorComponent={() => <Spacer size={5} />}
            ListHeaderComponent={
              <Text marginVertical={'$2'} fontWeight={'bold'} fontSize={'$4'}>
                PRODUTOS
              </Text>
            }
            ListFooterComponent={
              <YStack>
                <Separator marginVertical={'$2'} />
                <Text textAlign="right" fontSize={'$5'}>
                  TOTAL: {formatCurrency(totalAmount)}
                </Text>
              </YStack>
            }
            renderItem={({ item }) => (
              <XStack
                borderBottomWidth={1}
                borderColor={'$color'}
                padding={'$2'}
                flex={1}
                gap={'$2'}
              >
                <Text fontSize={'$3'} width={'$2'}>
                  {item.quantity}
                </Text>
                <Text flex={1} fontSize={'$3'}>
                  {item.product_name}
                </Text>
                <Text fontSize={'$3'} width={'$7'} textAlign="right">
                  {formatCurrency((item.sale_price || 0) * item.quantity)}
                </Text>
              </XStack>
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
          <Button onPress={printToFile} marginBottom={'$4'} variant="outlined">
            <Button.Icon>
              <Printer />
            </Button.Icon>
          </Button>
        </YStack>
      </Modal>
    </YStack>
  );
}
