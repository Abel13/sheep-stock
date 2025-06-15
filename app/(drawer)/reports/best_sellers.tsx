import { EmptyList } from '@/components/molecules/EmptyList';
import { Loading } from '@/components/molecules/Loading';
import { supabase } from '@/services/supabaseClient';
import { subtractPeriod, today } from '@/utils/date';
import { Regex } from '@tamagui/lucide-icons';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import {
  ListItem,
  ScrollView,
  styled,
  Text,
  ToggleGroup,
  YStack,
} from 'tamagui';

export default function BestSellers() {
  const [period, setPeriod] = useState('6months');
  const startDate = useMemo(() => {
    const match = period.match(/^(\d+)([a-zA-Z]+)$/);

    if (match) {
      const quantity = Number(match[1]);
      const period = match[2];
      return subtractPeriod({ [period]: quantity });
    }
  }, [period]);

  const fetchBestSellers = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        const { data, error } = await supabase.rpc(
          'count_product_sales_by_period',
          {
            start_date: startDate,
            end_date: endDate,
          },
        );

        if (error) throw new Error(error.message);
        return data;
      } catch (error) {
        console.warn(error);
        throw error;
      }
    },
    [supabase],
  );

  const {
    data: bestSellers,
    error,
    isLoading,
  } = useQuery<{ product_code: string; name: string; total_sales: number }[]>({
    queryKey: ['best-sellers', period],
    queryFn: () => fetchBestSellers(startDate!, today),
    enabled: !!startDate,
  });

  const renderOptions = () => {
    return (
      <ToggleGroup
        margin={'$2'}
        backgroundColor="$background"
        orientation={'horizontal'}
        id={'filter'}
        type={'single'}
        disableDeactivation={true}
        alignSelf="center"
        value={period}
        onValueChange={setPeriod}
      >
        <ToggleGroup.Item value="7days">
          <Text>7 dias</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="15days">
          <Text>15 dias</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="1months">
          <Text>1 mês</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="6months">
          <Text>6 meses</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="1years">
          <Text>1 ano</Text>
        </ToggleGroup.Item>
      </ToggleGroup>
    );
  };

  if (isLoading)
    return (
      <YStack flex={1} backgroundColor="$background">
        <Loading message="Carregando produtos..." />
      </YStack>
    );

  if (!bestSellers || bestSellers.length === 0)
    return (
      <YStack flex={1} backgroundColor="$background">
        {renderOptions()}
        <EmptyList
          icon="shopping-bag"
          message="Realize vendas no período selecionado"
        />
      </YStack>
    );

  if (error)
    return (
      <YStack flex={1} backgroundColor="$background">
        {renderOptions()}
        <EmptyList
          icon="alert-triangle"
          title="Ocorreu um erro"
          message="Falha ao buscar os itens"
        />
      </YStack>
    );

  return (
    <YStack flex={1} backgroundColor="$background">
      {renderOptions()}
      <ScrollView
        paddingHorizontal="$2"
        paddingTop="$2"
        backgroundColor="$background"
      >
        {bestSellers.map(item => {
          return (
            <ListItem
              key={item.product_code}
              borderWidth={1}
              marginBottom={'$2'}
              radiused
              title={item.total_sales || 0}
              subTitle={item.name}
            />
          );
        })}
      </ScrollView>
    </YStack>
  );
}
