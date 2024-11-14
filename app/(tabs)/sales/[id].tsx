import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Card,
  Separator,
  Spacer,
} from 'tamagui';
import { FlatList } from 'react-native';

// Função para buscar detalhes da venda
const fetchSaleDetails = async ({ queryKey }) => {
  const [, saleId] = queryKey;

  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .single();

  if (saleError) throw new Error(saleError.message);

  const { data: saleItems, error: itemsError } = await supabase
    .from('sale_products')
    .select(`
      product_code,
      quantity,
      unit_price,
      total_price,
      products (product_name)
    `)
    .eq('sale_id', saleId);

  if (itemsError) throw new Error(itemsError.message);

  return { sale: saleData, items: saleItems };
};

export default function SaleDetails() {
  const { id } = useLocalSearchParams();
  const saleId = id?.toString() || '';
  const router = useRouter();

  const { data, error, isLoading } = useQuery({
    queryKey: ['saleDetails', saleId],
    queryFn: fetchSaleDetails,
  });

  if (isLoading) return <YStack padding="$4"><Text>Loading...</Text></YStack>;
  if (error) return <YStack padding="$4"><Text color="$red10">Error: {error.message}</Text></YStack>;

  const { sale, items } = data;

  return (
    <YStack flex={1} padding="$4" backgroundColor="$background">
      <YStack marginBottom="$4">
        <Text fontSize="$5" fontWeight="bold">{sale.customer_name}</Text>
        <Text fontSize={8} marginBottom='$2'>ID da Venda: {sale.id}</Text>
        <Text fontSize={12} fontWeight={'600'}>{new Date(sale.sale_date).toLocaleDateString()}</Text>
        <Text fontWeight={'bold'}>Total: R$ {sale.total_amount.toFixed(2)}</Text>
      </YStack>

      <Text fontSize="$4" marginBottom="$3">Itens</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product_code}
        ItemSeparatorComponent={() => <Spacer size="$1" />}
        renderItem={({ item }) => (
          <Card
            paddingHorizontal="$3"
            paddingVertical='$2'
            bordered
            radiused
            hoverTheme
            pressTheme
          >
            <Text color="$gray10Dark" fontSize={8}>{item.product_code}</Text>
            <Text fontSize={12}>{item.products.product_name}</Text>
            <XStack justifyContent="space-between" marginTop='$3'>
              <YStack alignItems='center'>
                <Text fontWeight={'600'}>QTD:</Text>
                <Text fontWeight={'600'}>{item.quantity}</Text>
              </YStack>
              <YStack alignItems='center'>
                <Text fontWeight={'600'}>PREÇO UNIT.:</Text>
                <Text fontWeight={'600'}>R$ {item.unit_price.toFixed(2)}</Text>
              </YStack>
              <YStack alignItems='flex-end'>
                <Text fontSize="$2" color="$colorSubtle">TOTAL</Text>
                <Text fontSize="$4" fontWeight={'600'}>R$ {item.total_price.toFixed(2)}</Text>
              </YStack>
              
            </XStack>
          </Card>
        )}
      />
    </YStack>
  );
}