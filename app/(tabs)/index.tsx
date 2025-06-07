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
import { FlatList, Modal, RefreshControl } from 'react-native';
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

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            color: #333;
          }
          header {
            text-align: center;
            margin-bottom: 30px;
          }
          img {
            max-width: 120px;
            margin-bottom: 10px;
          }
          h1 {
            font-size: 24px;
            margin: 10px 0;
          }
          .info {
            margin-bottom: 20px;
            font-size: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <header>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="2500 300 500 500"
          >
            <title>Espaço Natural - vetor</title>
            <style>
              .s0 { fill: #a8af8d }
              .s1 { fill: #b9aacb }
            </style>
            <g>
              <g id="Camada 1">
                <g id="&lt;Group&gt;">
                  <g id="&lt;Group&gt;">
                    <g id="&lt;Group&gt;">
                      <path id="&lt;Path&gt;" class="s0" d="m2722.4 472.8c-2.1-4.1-4.1-8-6-11.8h-23.6c4.3 8.3 8.9 17.2 13.6 26.3 9.6 18.5 20 38.2 30.9 57.2h24.8c-14.4-24.4-28.4-49.8-39.7-71.7z"/>
                    </g>
                    <g id="&lt;Group&gt;">
                      <path id="&lt;Path&gt;" class="s0" d="m2698.7 643.7v-87.5h83.4v-4h-6.5-42.7-34.2v-63-24.1h28.4 63v-4h-65-40.9-6.8v186.6h115.4v-4z"/>
                    </g>
                    <g id="&lt;Group&gt;">
                      <path id="&lt;Path&gt;" class="s0" d="m2837 641.1c-4.8-6.1-8.5-13-11-20.4-2.3-6.9-3.4-14.1-3.7-21.4-0.3-7.2 0.2-14.5 1.2-21.6 1-7 2.4-13.9 4-20.8 1.4-6.4 3-12.7 4.4-19.1 2.1-9.2 3.4-18.6 3.6-28q0.1-2.1 0.1-4.2c-0.1-10.3-1.5-20.4-4.3-30.3-1.2-4.4-2.4-8.8-4-13.1-3-8.4-7.6-16.2-10.2-24.8-1.2-4.1-1.9-8.4-1.7-12.7 0.2-2.8 0.7-5.7 1.7-8.3 1.4-3.9 3.8-7.4 7-9.9 2.7-2.2 5.9-3.7 9.3-4.7-0.6 0.9-1.1 1.9-1.4 2.9-4.9 14.8 7.8 23.8 3.1 35.2-1.9 4.2-6.2 7-9.9 9.7q-0.1 0.1-0.1 0.2c0.1 0.1 0.2 0.1 0.2 0.1 2.3-1 4.5-2 6.6-3.4 10.9-7.1 7.4-17.6 3.6-27.6-1.6-4.3-2-9-0.9-13.5 0.5-1.8 1.4-4.1 3.3-4.5q0.1-0.1 0.1-0.1c0.5 0 0.9-0.5 0.9-1-0.2-2.2-5.4 0.4-6.3 0.8q-4.9 1.9-9.1 5.1c-8.6 6.5-12.7 18-10.8 28.6 0.4 2.4 1 4.8 1.8 7-1.9-2.1-4-4-6-5.8-4.2-3.7-8.9-6.5-13.9-9-10.1-5-22.9-6.4-33.3-3.7-7.4 1.9-15.7 6.2-19.6 13.1-1.6 2.7-2.5 5.8-3.4 8.7-0.8 2.6-1.1 5.2-1.7 7.9-0.1 0.5 0.7 0.9 1.1 0.4 6.3-7.7 13.6-8.9 23.1-7.4 8.9 1 19.5-0.6 25.7-7.6 0.2-0.2 0-0.4-0.2-0.3-4 2.2-8.1 3.3-12.3 3.8-6.6 0.8-13.1-0.3-19.8 0-6.5 0.2-11.6 4.6-15.9 9.1 0.2-0.2 0.2-0.9 0.3-1.2q0.3-0.6 0.5-1.3 0.5-1.3 1.1-2.6c0.9-1.8 2.1-3.4 3.2-5 1.1-1.6 2.1-3.2 3.4-4.5 4.1-4.2 9.9-6.3 15.5-7.6 4.5-1 9.1-1.5 13.7-1.3q1.5 0.1 3.1 0.3c5.2 0.7 10.4 2.1 15.3 4.1 5.5 2.3 10.7 5.5 15.2 9.4 2.7 2.4 4.9 5.1 7 7.9 1.8 2.5 3.5 5.2 4.8 8q0.4 0.8 0.7 1.6c3.4 8 6.6 16.2 8.4 24.8 2.3 11.2 2.4 22.8 1.4 34.2q-0.5 5.5-1.4 10.9c-0.6-1.7-1.7-3.2-3.4-4.2-1.5-0.8-3.3-1-5-1.2-2.9-0.4-5.9-0.8-8.5-1.8-4-1.6-7-4.5-9.3-8.1-2.4-3.6-3.7-8.2-4.9-12.4-1.9-6-5.3-11.9-10.7-15.4q-3.8-2.7-7.9-4.8c7.2-2.2 15-1.3 22.2 0.9 8.3 2.5 16.6 6.8 21.4 14.3 1.6 2.5 2.7 5.3 3.4 8.3 0 0.1 0.1 0.2 0.2 0.2 0.1 0 0.3-0.1 0.3-0.2 0.1-3.2-0.5-6.4-1.8-9.4-6.4-14.5-26.3-22.1-41.3-19.5-3.4 0.6-6.8 1.8-9.8 3.5-0.1 0.1-0.1 0.1-0.4 0.4-1 0.9-0.5 2.7 0.7 3.1 4.1 1.3 8.2 2.7 12 4.8 1.3 0.7 2.5 1.6 3.6 2.5 3.3 3.1 5.4 7.4 6.3 11.7 0.7 4.8 1.1 9.5 3.4 13.9 4.1 8.2 11.9 11.4 20.7 11.6 0 0 2.3 0.1 2.3 0.1 2.6 0 4.4 2.4 5.1 4.8 0.4 1.3 0.4 2.5 0.1 3.9q-0.7 2.8-1.4 5.6c-1.3 4.7-2.7 9.3-4 14-3 10.9-5.8 21.9-7.3 33.2-1.7 14-1.5 29 4.8 41.9-13.3-13.7-30.3-38.2-47.4-66h-25.1c26.7 43.7 55.9 79.6 84 82.3 7.7 12.2 20.5 12.7 22.3 7.7 1.9-5.3-8.7-9.6-18.1-12.8z"/>
                    </g>
                  </g>
                  <g id="&lt;Group&gt;">
                    <g id="&lt;Group&gt;">
                      <path id="&lt;Compound Path&gt;" fill-rule="evenodd" class="s1" d="m2764 745.9c-84.8 0-153.9-92.4-153.9-205.9 0-113.5 69.1-205.9 153.9-205.9 84.8 0 153.9 92.4 153.9 205.9 0 113.5-69.1 205.9-153.9 205.9zm0-407.2c-82.3 0-149.2 90.3-149.2 201.3 0 111 66.9 201.3 149.2 201.3 82.3 0 149.2-90.3 149.2-201.3 0-111-66.9-201.3-149.2-201.3z"/>
                    </g>
                    <g id="&lt;Group&gt;">
                      <path id="&lt;Compound Path&gt;" fill-rule="evenodd" class="s1" d="m2764 745.9c-92.5 0-167.7-92.4-167.7-205.9 0-113.5 75.2-205.9 167.7-205.9 92.5 0 167.7 92.4 167.7 205.9 0 113.5-75.2 205.9-167.7 205.9zm0-407.2c-89.9 0-163.1 90.3-163.1 201.3 0 111 73.2 201.3 163.1 201.3 89.9 0 163.1-90.3 163.1-201.3 0-111-73.2-201.3-163.1-201.3z"/>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>

          <h1>Recibo de Venda</h1>
        </header>

        <div class="info">
          <p><strong>Cliente:</strong> ${getValues('customerName') || 'Não informado'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Valor pago:</strong> ${formatCurrency(getValues('valuePaid') || 0)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedProducts
              .map(
                item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.sale_price?.toFixed(2) || 0}</td>
                <td>R$ ${((item.sale_price || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <p class="total">TOTAL: R$ ${totalAmount.toFixed(2)}</p>
      </body>
    </html>
    `;

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
              {formatCurrency(getValues('valuePaid')) || formatCurrency(0)}
            </Text>
          </XStack>
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
