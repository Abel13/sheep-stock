import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import {
  YStack,
  XStack,
  ListItem,
  Label,
  Button,
  Spacer,
  Card,
  Text,
  Spinner,
  Separator,
  Select,
  Adapt,
  Sheet,
} from 'tamagui';
import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, SectionList } from 'react-native';
import { firstMonthDay, lastMonthDay } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { Sale } from '@/types/Sale';
import { useMemo, useState } from 'react';
import { ChevronDown } from '@tamagui/lucide-icons';

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

const fetchMonthlySales = async (month: number, year: number) => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .filter('sale_date', 'gt', firstMonthDay(month, year))
    .filter('sale_date', 'lte', lastMonthDay(month, year))
    .order('sale_date');

  if (error) throw new Error(error.message);
  return data;
};

export default function LowStockScreen() {
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
    queryKey: ['monthly', selectedMonth, selectedYear],
    queryFn: () =>
      fetchMonthlySales(parseInt(selectedMonth), parseInt(selectedYear)),
  });

  const groupedSales = useMemo(() => {
    if (!sales) return [];
    return [
      {
        title: `${months[parseInt(selectedMonth) - 1].label} ${selectedYear}`,
        totalAmount: sales.reduce(
          (sum, sale) => sum + (sale.total_amount || 0),
          0,
        ),
        totalPaid: sales.reduce((sum, sale) => sum + (sale.value_paid || 0), 0),
        data: sales,
      },
    ];
  }, [sales, selectedMonth, selectedYear]);

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
        <Spinner size="large" color="$lavender" />
        <Text>Carregando produtos...</Text>
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
      <SectionList
        sections={groupedSales}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={isLoading} />}
        refreshing={isLoading}
        renderSectionHeader={({ section: { title } }) => (
          <YStack paddingVertical="$3" backgroundColor={'$background'}>
            <Text fontSize="$4" fontWeight="bold" color="$color10">
              {title}
            </Text>
          </YStack>
        )}
        renderSectionFooter={({ section: { totalAmount, totalPaid } }) => (
          <YStack paddingVertical="$3">
            <Text
              fontSize="$4"
              color="$gray20Dark"
              textAlign="right"
              fontWeight={600}
              paddingInline="$2"
            >
              Total: {formatCurrency(totalAmount)}
            </Text>
            <Text
              fontSize="$3"
              color="$gray10Dark"
              textAlign="right"
              paddingInline="$2"
            >
              Total Pago: {formatCurrency(totalPaid)}
            </Text>
            <Separator borderColor="$borderColor" marginTop="$2" />
          </YStack>
        )}
        renderItem={({ item }: { item: Sale }) => (
          <Card padding="$3" bordered radiused hoverTheme pressTheme>
            <Text fontSize={8} color="$gray10Dark" marginBottom="$1">
              ID: {item.id}
            </Text>
            <XStack alignItems="center">
              <YStack flex={1}>
                <Text fontSize={16}>{item.customer_name}</Text>
                <Text fontSize={12}>
                  {new Date(item.sale_date!).toLocaleDateString()}
                </Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={12} color="$colorSubtle">
                  TOTAL
                </Text>
                <Text fontSize="$4">{formatCurrency(item.total_amount)}</Text>
                <Spacer size="$2" />
                <XStack alignItems="flex-end">
                  <Text
                    fontSize={12}
                    color={
                      item.value_paid !== item.total_amount
                        ? '$red10Dark'
                        : '$colorSubtle'
                    }
                  >
                    TOTAL PAGO: {formatCurrency(item.value_paid)}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </Card>
        )}
        ItemSeparatorComponent={() => <Spacer size="$1" />}
      />
    </YStack>
  );
}
