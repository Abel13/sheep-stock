import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import {
  YStack,
  XStack,
  Label,
  Card,
  Text,
  Select,
  Adapt,
  Sheet,
  Accordion,
  Separator,
  ScrollView,
} from 'tamagui';
import { firstMonthDay, lastMonthDay } from '@/utils/date';
import { convertNumberToLocaleString } from '@/utils/number';
import { useMemo, useState } from 'react';
import { ChevronDown } from '@tamagui/lucide-icons';
import { Loading } from '@/components/molecules/Loading';

const months = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2023 }, (_, i) => ({
  value: (2024 + i).toString(),
  label: (2024 + i).toString(),
}));

const fetchMonthlySalesBySeller = async (month: number, year: number) => {
  const { data, error } = await supabase
    .from('sales')
    .select('seller_id, customer_name, total_amount, sale_date, sellers(name)')
    .filter('sale_date', 'gt', firstMonthDay(month, year))
    .filter('sale_date', 'lte', lastMonthDay(month, year));

  if (error) throw new Error(error.message);
  return data;
};

export default function SalesBySellerReport() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    (currentDate.getMonth() + 1).toString(),
  );
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString(),
  );

  const {
    data: sales,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['monthly_by_seller', selectedMonth, selectedYear],
    queryFn: () =>
      fetchMonthlySalesBySeller(
        parseInt(selectedMonth),
        parseInt(selectedYear),
      ),
  });

  const grouped = useMemo(() => {
    const map: Record<string, { total: number; sales: any[] }> = {};
    let total = 0;
    (sales || []).forEach(sale => {
      const name = (sale as any).sellers?.name || 'Sem vendedor';
      const amount = sale.total_amount || 0;
      if (!map[name]) map[name] = { total: 0, sales: [] };
      map[name].total += amount;
      map[name].sales.push(sale);
      total += amount;
    });
    const data = Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({ name, total: map[name].total, sales: map[name].sales }));
    return { total, data };
  }, [sales]);

  if (isLoading)
    return (
      <YStack
        flex={1}
        padding="$4"
        paddingTop="$10"
        backgroundColor="$background"
        alignItems="center"
        gap={10}
      >
        <Loading message="Carregando relatório..." />
      </YStack>
    );
  if (error)
    return (
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Label>Erro: {error.message}</Label>
      </YStack>
    );

  return (
    <YStack padding="$3" flex={1} backgroundColor="$background">
      <XStack gap="$2" justifyContent="center">
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
          disablePreventBodyScroll
        >
          <Select.Trigger width={'50%'} iconAfter={ChevronDown}>
            <Select.Value placeholder="Mês..." />
          </Select.Trigger>

          <Adapt platform="touch">
            <Sheet modal dismissOnSnapToBottom>
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                backgroundColor="$shadowColor"
                animation="medium"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={200000}>
            <Select.ScrollUpButton />
            <Select.Viewport minWidth={200}>
              <Select.Group>
                <Select.Label>Mês</Select.Label>
                {months.map((month, index) => (
                  <Select.Item
                    key={month.value}
                    value={month.value}
                    index={index}
                  >
                    <Select.ItemText>{month.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>

        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
          disablePreventBodyScroll
        >
          <Select.Trigger width={'50%'} iconAfter={ChevronDown}>
            <Select.Value placeholder="Ano..." />
          </Select.Trigger>

          <Adapt platform="touch">
            <Sheet modal dismissOnSnapToBottom>
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                backgroundColor="$shadowColor"
                animation="medium"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={200000}>
            <Select.ScrollUpButton />
            <Select.Viewport minWidth={200}>
              <Select.Group>
                <Select.Label>Ano</Select.Label>
                {years.map((year, index) => (
                  <Select.Item
                    key={year.value}
                    value={year.value}
                    index={index}
                  >
                    <Select.ItemText>{year.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>
      </XStack>

      <YStack marginTop="$3" gap={6}>
        <Text fontSize="$5" fontWeight="600">
          {months[parseInt(selectedMonth) - 1].label} {selectedYear}
        </Text>
        <Text fontSize="$4">
          {`Total: ${convertNumberToLocaleString({ value: grouped.total, type: 'currency' })}`}
        </Text>
      </YStack>

      <ScrollView>
        <YStack marginTop="$2" gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$color10">
            Vendedores
          </Text>
          <Accordion type="multiple" defaultValue={[]} gap={'$2'}>
            {grouped.data.map(group => (
              <Accordion.Item key={group.name} value={group.name}>
                <Accordion.Trigger>
                  <XStack alignItems="center" justifyContent="space-between">
                    <YStack>
                      <Text fontSize={14}>{group.name}</Text>
                      <Text fontSize="$5" color={'$purple'} fontWeight={600}>
                        {convertNumberToLocaleString({
                          value: group.total,
                          type: 'currency',
                        })}
                      </Text>
                    </YStack>
                    <ChevronDown />
                  </XStack>
                </Accordion.Trigger>
                <ScrollView>
                  <Accordion.Content>
                    <YStack gap="$2" paddingVertical="$2">
                      {group.sales
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.sale_date || 0).getTime() -
                            new Date(a.sale_date || 0).getTime(),
                        )
                        .map(sale => (
                          <Card key={sale.id} padding="$3" bordered radiused>
                            <XStack
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <YStack>
                                <Text fontSize={12} color="$gray10Dark">
                                  {new Date(
                                    sale.sale_date || '',
                                  ).toLocaleDateString()}
                                </Text>
                                <Text fontSize={14}>
                                  {sale.customer_name || '-'}
                                </Text>
                              </YStack>
                              <Text fontSize="$5" fontWeight={600}>
                                {convertNumberToLocaleString({
                                  value: sale.total_amount || 0,
                                  type: 'currency',
                                })}
                              </Text>
                            </XStack>
                          </Card>
                        ))}
                    </YStack>
                  </Accordion.Content>
                </ScrollView>
              </Accordion.Item>
            ))}
          </Accordion>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
