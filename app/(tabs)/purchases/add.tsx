import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/services/supabaseClient';
import { api } from '@/services/api';
import {
  YStack,
  XStack,
  Text,
  Button,
  ListItem,
  Spacer,
  useTheme,
  View,
  Card,
  Spinner,
} from 'tamagui';
import { FlatList } from 'react-native';
import { useToastController } from '@tamagui/toast';
import { ProductXML, PurchaseXML } from '@/types/PurchaseXML';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/currency';
import { uploadFile } from '@/services/file';

export default function PurchaseUploadScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const toast = useToastController();

  const [purchaseData, setPurchaseData] = useState<PurchaseXML>();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: response => {
      const { data } = response;
      console.log('VOLTOU', data);

      if (data) setPurchaseData(data);

      setIsUploading(false);
    },
    onError: () => {
      setIsUploading(false);
      toast.show('Erro!', {
        message: 'Falha ao enviar o arquivo XML!',
      });
    },
  });

  // const decrementQuantity = productCode => {
  //   setItems(prevItems =>
  //     prevItems.map(item =>
  //       item.product_code === productCode
  //         ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
  //         : item,
  //     ),
  //   );
  // };

  // const incrementQuantity = productCode => {
  //   setItems(prevItems =>
  //     prevItems.map(item =>
  //       item.product_code === productCode
  //         ? { ...item, quantity: item.quantity + 1 }
  //         : item,
  //     ),
  //   );
  // };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/xml',
      });

      if (result.canceled) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: 'application/xml',
      });

      console.log('APPEND', formData);
      mutation.mutate(formData);
    } catch (error) {
      setIsUploading(false);
      toast.show('Erro!', {
        message: 'Falha ao selecionar o arquivo!',
      });
    }
  };

  const convertDateToISO = dateStr => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const removeCnpjFormatting = cnpj => {
    return cnpj.replace(/\D/g, '');
  };

  const handleSaveOrder = async () => {
    const { supplier, cnpj, purchase_date, order_products } = purchaseData!;

    const cleanCnpj = removeCnpjFormatting(cnpj);
    const formattedDate = convertDateToISO(purchase_date);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ supplier, cnpj: cleanCnpj, purchase_date: formattedDate }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderId = order.id;

      const orderProducts = order_products.map(item => ({
        order_id: orderId,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
      }));

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts);

      if (productsError) throw productsError;

      toast.show('Sucesso!', {
        message: 'Compra salva com sucesso!',
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setPurchaseData(undefined);
    } catch (error) {
      console.log(error);
      toast.show('Erro!', {
        message: 'Falha ao salvar os dados no Supabase!',
      });
    }
  };

  if (!purchaseData)
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        paddingTop={'$2'}
      >
        <Card
          paddingHorizontal="$4"
          padding="$2"
          bordered
          onPress={handlePickDocument}
        >
          <Text marginBottom="$4" color={'$gray10Dark'}>
            Selecione o XML da nota fiscal da compras
          </Text>

          <XStack justifyContent="center" gap={'$2'}>
            <Button.Icon>
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={theme.color.val}
              />
            </Button.Icon>
            {isUploading ? <Spinner /> : <Text>{'Carregar arquivo'}</Text>}
          </XStack>
        </Card>
      </YStack>
    );

  return (
    <YStack
      flex={1}
      paddingHorizontal="$4"
      paddingTop="$2"
      backgroundColor="$background"
    >
      <Text fontWeight="500" color={'$black05'}>
        {purchaseData.cnpj}
      </Text>
      <Text fontWeight="bold" marginBottom={'$2'}>
        {purchaseData.supplier}
      </Text>
      <Text>Data da Compra: {purchaseData.purchase_date}</Text>

      <Spacer size="$4" />

      <FlatList
        data={purchaseData.order_products}
        keyExtractor={(item: ProductXML) => item.product_code}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        ItemSeparatorComponent={() => <Spacer size="$2" />}
        renderItem={({ item }) => (
          <ListItem
            key={item.product_code}
            borderWidth={1}
            radiused
            padding="$3"
          >
            <YStack flex={1} gap="$2">
              <Text>{item.product_name}</Text>
              <Text>
                Total: {formatCurrency(item.unit_price * item.quantity)}
              </Text>
            </YStack>
            <XStack gap="$2" alignItems="center" marginInline="$2">
              <Text fontSize={'$4'}>
                {item.quantity.toString().padStart(2, '0')}
              </Text>
            </XStack>
          </ListItem>
        )}
      />

      <Spacer size="$4" />
      <Button onPress={handleSaveOrder} variant="outlined">
        Salvar Compra
      </Button>
      <Spacer size="$4" />
    </YStack>
  );
}
