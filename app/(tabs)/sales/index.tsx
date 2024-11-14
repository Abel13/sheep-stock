import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'expo-router';
import { SectionList } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Card,
  Separator,
  Spacer,
} from 'tamagui';
import { Sale } from '@/types/Sale';

// Função para buscar vendas
const fetchSales = async () => {
  let query = supabase.from('sales').select('*').order('sale_date', { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Função para agrupar vendas por data e calcular o total de vendas do dia
const groupSalesByDate = (sales) => {
  const groupedSales = sales.reduce((acc, sale) => {
    const saleDate = new Date(sale.sale_date).toLocaleDateString();
    if (!acc[saleDate]) {
      acc[saleDate] = { totalAmount: 0, sales: [] };
    }
    acc[saleDate].totalAmount += sale.total_amount || 0;
    acc[saleDate].sales.push(sale);
    return acc;
  }, {});

  return Object.keys(groupedSales).map((date) => ({
    title: date,
    totalAmount: groupedSales[date].totalAmount,
    data: groupedSales[date].sales,
  }));
};

export default function Sales() {
  const router = useRouter();

  const { data: sales, error, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => fetchSales(),
  });

  if (isLoading) return <YStack padding="$4"><Text>Loading...</Text></YStack>;
  if (error) return <YStack padding="$4"><Text color="$red10">Error: {error.message}</Text></YStack>;

  const groupedSales = groupSalesByDate(sales || []);

  return (
    <YStack flex={1} paddingHorizontal="$4" paddingTop="$2" backgroundColor="$background">
      <SectionList
        sections={groupedSales}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <YStack paddingVertical="$3" backgroundColor={'$background'}>
            <Text fontSize="$4" fontWeight="bold" color="$color10">{title}</Text>
          </YStack>
        )}
        renderSectionFooter={({ section: { totalAmount } }) => (
          <YStack paddingVertical="$3">
            <Text fontSize="$4" color="$gray10Dark" textAlign='right' paddingInline='$2'>Total: R$ {totalAmount.toFixed(2)}</Text>
            <Separator borderColor="$borderColor" marginTop='$2'/>
          </YStack>
        )}
        renderItem={({ item }: { item: Sale }) => (
          <Card
            onPress={() => router.push({ pathname: '/(tabs)/sales/[id]', params: { id: item.id } })}
            padding="$3"
            bordered
            radiused
            hoverTheme
            pressTheme
          >
            <Text fontSize={8} color="$gray10Dark" marginBottom="$1">ID: {item.id}</Text>
            <XStack alignItems="center">
              <YStack flex={1}>
                <Text fontSize={16}>{item.customer_name}</Text>
                <Text fontSize={12}>{new Date(item.sale_date!).toLocaleDateString()}</Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={12} color="$colorSubtle">TOTAL</Text>
                <Text fontSize="$4">R$ {item.total_amount.toFixed(2)}</Text>
              </YStack>
            </XStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Spacer size="$1" />}
      />
    </YStack>
  );
}