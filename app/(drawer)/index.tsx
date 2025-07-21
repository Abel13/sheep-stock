import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { Product } from '@/types/Product';
import { Service } from '@/types/Service';
import {
  YStack,
  XStack,
  Button,
  Text,
  Spacer,
  Label,
  Card,
  useTheme,
  Separator,
} from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { Barcode, Printer, Share2 } from '@tamagui/lucide-icons';
import { FlatList, Modal } from 'react-native';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { saleSchema, SaleFormValues } from '@/schemas/saleSchema';
import { CurrencyFormField } from '@/components/molecules/FormField/CurrencyFormField';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormField } from '@/components/molecules/FormField/FormField';
import { convertNumberToLocaleString } from '@/utils/number';
import { createSale } from '@/services/sale';
import { SearchField } from '@/components/molecules/SearchField';
import { ProductListItem } from '@/components/molecules/ProductListItem';
import { CartItem } from '@/components/molecules/CartItem';
import { EmptyList } from '@/components/molecules/EmptyList';
import { Feather } from '@expo/vector-icons';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { BarcodeScanningResult } from 'expo-camera';
import {
  ItemSale,
  ItemSaleProduct,
  ItemSaleService,
  SearchItemProps,
} from '@/types/ItemSale';
import { useInvoice } from '@/hooks/useInvoice';

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

const fetchServices = async (search: string): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('discontinued', false)
      .or(`name.ilike.%${search}%`);

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
  const { print } = useInvoice();

  const [search, setSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<ItemSaleProduct[]>(
    [],
  );
  const [selectedServices, setSelectedServices] = useState<ItemSaleService[]>(
    [],
  );
  const showSearchResults = search.length > 0;

  const { hasPermission, CameraViewComponent } = useBarcodeScanner();

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetchProducts(search),
    enabled: !!search,
  });
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services', search],
    queryFn: () => fetchServices(search),
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
        (total, product) => total + product.sale_price * product.quantity,
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

  const handleAddItem = (item: SearchItemProps) => {
    const productExists = selectedProducts.find(
      p => p.product_code === item.code,
    );
    const serviceExists = selectedServices.find(
      p => p.service_code === item.code,
    );

    if (!productExists && item.type === 'PRODUCT') {
      const productToAdd: ItemSaleProduct = {
        index: itemCount,
        quantity: 1,
        stock_quantity: item.stock_quantity || 0,
        product_code: item.code,
        product_name: item.name,
        sale_price: item.price || 0,
      };
      setSelectedProducts(prev => [productToAdd, ...prev]);
    }

    if (!serviceExists && item.type === 'SERVICE') {
      const serviceToAdd: ItemSaleService = {
        index: itemCount,
        name: item.name,
        price: item.price,
        service_code: item.code,
      };
      setSelectedServices(prev => [serviceToAdd, ...prev]);
    }

    setItemCount(itemCount + 1);
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

  const decrementQuantity = (code: string) => {
    setSelectedProducts(prev =>
      prev
        .map(product =>
          product.product_code === code
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        )
        .filter(product => product.quantity > 0),
    );

    setSelectedServices(prev =>
      prev.filter(service => service.service_code !== code),
    );
  };

  const totalAmount =
    selectedProducts.reduce(
      (total, product) => total + product.sale_price * product.quantity,
      0,
    ) + selectedServices.reduce((total, product) => total + product.price, 0);

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products_list', ''] });
      setSelectedProducts([]);
      setSelectedServices([]);
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

  const searchItems: SearchItemProps[] = useMemo(() => {
    const prods: SearchItemProps[] =
      products?.map(item => {
        return {
          code: item.product_code || '',
          name: item.product_name || '',
          price: item.sale_price || 0,
          stock_quantity: item.stock_quantity || 0,
          type: 'PRODUCT',
        };
      }, []) || [];

    const servs: SearchItemProps[] =
      services?.map(item => {
        return {
          code: item.service_code || '',
          name: item.name || '',
          price: item.price || 0,
          stock_quantity: 1,
          type: 'SERVICE',
        };
      }, []) || [];

    return [...(prods || []), ...(servs || [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products, services]);

  const selectedItems: ItemSale[] = useMemo(() => {
    const prods: ItemSale[] =
      selectedProducts?.map(item => {
        return {
          code: item.product_code,
          name: item.product_name,
          price: item.sale_price,
          stock_quantity: item.stock_quantity,
          index: item.index,
          quantity: item.quantity,
        };
      }, []) || [];

    const servs: ItemSale[] =
      selectedServices?.map(item => {
        return {
          code: item.service_code,
          name: item.name,
          price: item.price,
          stock_quantity: 1,
          quantity: 1,
          index: item.index,
        };
      }, []) || [];

    return [...(prods || []), ...(servs || [])];
  }, [selectedProducts, selectedServices]);

  const allowFinish = selectedItems.length > 0;
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
        saleServices: selectedServices,
      });

      reset();
      setSelectedProducts([]);
      setSelectedServices([]);
    } catch (error) {
      console.error('Erro ao finalizar a venda');
    }
  };

  const handleScanResult = (result: BarcodeScanningResult) => {
    setShowScanner(false);
    setSearch(result.data);
  };

  const handlePrint = () => {
    print({
      customerName: getValues('customerName'),
      selectedItems,
      totalAmount,
      valuePaid: getValues('valuePaid'),
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding={'$4'} gap={'$2'}>
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
      </YStack>
      <YStack flex={1} paddingInline={'$2'}>
        <Label fontSize={'$7'}>Produtos:</Label>
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
            top={80}
            left={'$2'}
            right={66}
            borderInlineWidth={1}
            borderBottomWidth={3}
            borderColor="$borderColorHover"
            backgroundColor={'$background'}
            elevation={10}
            maxHeight={'65%'}
            zIndex={100}
          >
            <FlatList
              data={searchItems}
              keyExtractor={item => item.code}
              refreshing={loadingProducts || loadingServices}
              renderItem={({ item }) => (
                <ProductListItem item={item} onPress={handleAddItem} />
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
              showsVerticalScrollIndicator={false}
            />
          </YStack>
        )}
        <FlatList
          data={selectedItems}
          keyExtractor={item => item.code}
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
          showsVerticalScrollIndicator={false}
        />
      </YStack>

      <Card padding="$2" bordered radiused gap={10}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap={'$2'} marginBottom={'$2'}>
            <XStack gap={10}>
              <Text color="$color10">Total de itens:</Text>
              <Text color="$color10">{quantity}</Text>
            </XStack>

            <Text fontSize="$5" textAlign="right">
              {`Total: ${convertNumberToLocaleString({
                value: totalAmount,
                type: 'currency',
              })}`}
            </Text>
          </YStack>

          <Button onPress={() => setShowShare(true)} disabled={quantity === 0}>
            <Button.Icon>
              <Share2 />
            </Button.Icon>
          </Button>
        </XStack>

        <Button
          onPress={handleSubmit(handleFinalizeSale)}
          disabled={isSubmitting || !allowFinish}
          theme={isSubmitting || !allowFinish ? 'gray_active' : 'active'}
          marginBottom={'$5'}
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
          <Text marginBottom={'$2'} fontWeight={'bold'} fontSize={'$5'}>
            {getValues('customerName') || '--'}
          </Text>
          <XStack>
            <Text marginBottom={'$2'} fontWeight={'bold'}>
              {'VALOR PAGO: '}
            </Text>
            <Text marginBottom={'$2'}>
              {convertNumberToLocaleString({
                value: getValues('valuePaid'),
                type: 'currency',
              })}
            </Text>
          </XStack>
          <FlatList
            data={selectedItems}
            keyExtractor={item => item.code}
            ItemSeparatorComponent={() => <Spacer size={5} />}
            ListHeaderComponent={
              <Text marginVertical={'$2'} fontWeight={'bold'} fontSize={'$4'}>
                ITENS
              </Text>
            }
            ListFooterComponent={
              <YStack>
                <Separator marginVertical={'$2'} />
                <Text textAlign="right" fontSize={'$5'}>
                  {`Total: ${convertNumberToLocaleString({
                    value: totalAmount,
                    type: 'currency',
                  })}`}
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
                  {item.name}
                </Text>
                <Text fontSize={'$3'} width={'$7'} textAlign="right">
                  {convertNumberToLocaleString({
                    value: (item.price || 0) * item.quantity,
                    type: 'currency',
                  })}
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
            showsVerticalScrollIndicator={false}
          />
          <Button onPress={handlePrint} marginBottom={'$4'} variant="outlined">
            <Button.Icon>
              <Printer />
            </Button.Icon>
          </Button>
        </YStack>
      </Modal>
    </YStack>
  );
}
