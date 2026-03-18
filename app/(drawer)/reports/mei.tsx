import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { firstMonthDay, lastMonthDay } from '@/utils/date';
import { convertNumberToLocaleString } from '@/utils/number';
import {
  Adapt,
  Card,
  Input,
  Label,
  ScrollView,
  Select,
  Separator,
  Sheet,
  ToggleGroup,
  Text,
  YStack,
  XStack,
} from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import { Loading } from '@/components/molecules/Loading';
import { CurrencyInput } from '@/components/atoms/CurrencyInput';

type MonthlyTotals = {
  month: number;
  receitaBruta: number;
  valorRecebido: number;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2023 }, (_, i) => ({
  value: (2024 + i).toString(),
  label: (2024 + i).toString(),
}));

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

type SalesYearRow = {
  sale_date: string | null;
  total_amount: number;
  value_paid: number;
};

const fetchSalesForYear = async (year: number) => {
  const { data, error } = await supabase
    .from('sales')
    .select('sale_date,total_amount,value_paid')
    .filter('sale_date', 'gt', firstMonthDay(1, year))
    .filter('sale_date', 'lte', lastMonthDay(12, year));

  if (error) throw new Error(error.message);
  return (data || []) as SalesYearRow[];
};

export default function MEIReportScreen() {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Escopo calc-basic: parte manual simples (teve empregado)
  const [hadEmployee, setHadEmployee] = useState<'sim' | 'nao'>('nao');
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [totalRemuneration, setTotalRemuneration] = useState<number>(0);

  const {
    data: sales,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['mei-dasn', selectedYear],
    queryFn: () => fetchSalesForYear(parseInt(selectedYear)),
  });

  const { receitaBrutaTotal, valorRecebido, byMonth } = useMemo(() => {
    const monthly: Record<number, MonthlyTotals> = {};
    for (const m of months) {
      monthly[m.value] = {
        month: m.value,
        receitaBruta: 0,
        valorRecebido: 0,
      };
    }

    const rows = sales || [];
    const receitaTotal = rows.reduce(
      (sum, r) => sum + (r.total_amount || 0),
      0,
    );
    const recebidoTotal = rows.reduce((sum, r) => sum + (r.value_paid || 0), 0);

    for (const r of rows) {
      if (!r.sale_date) continue;
      const d = new Date(r.sale_date);
      const m = d.getMonth() + 1;
      if (!monthly[m]) continue;
      monthly[m].receitaBruta += r.total_amount || 0;
      monthly[m].valorRecebido += r.value_paid || 0;
    }

    const list = months.map(m => monthly[m.value]);
    return {
      receitaBrutaTotal: receitaTotal,
      valorRecebido: recebidoTotal,
      byMonth: list,
    };
  }, [sales]);

  const formattedYear = selectedYear;
  const byMonthWithValues = byMonth.filter(
    m => m.receitaBruta !== 0 || m.valorRecebido !== 0,
  );

  if (isLoading) {
    return (
      <YStack
        flex={1}
        padding="$4"
        paddingTop="$10"
        backgroundColor="$background"
        alignItems="center"
        gap={10}
      >
        <Loading message="Carregando dados para MEI..." />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Label>Erro: {error.message}</Label>
      </YStack>
    );
  }

  return (
    <YStack padding="$3" flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="800">
            MEI (DASN-SIMEI)
          </Text>

          <XStack gap="$2" justifyContent="center">
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
              disablePreventBodyScroll
            >
              <Select.Trigger width={'100%'} iconAfter={ChevronDown}>
                <Select.Value placeholder="Ano..." />
              </Select.Trigger>

              <Adapt platform="touch">
                <Sheet modal dismissOnSnapToBottom>
                  <Sheet.Frame>
                    <Sheet.ScrollView>
                      <Adapt.Contents />
                    </Sheet.ScrollView>
                  </Sheet.Frame>
                  <Sheet.Overlay backgroundColor="$shadowColor" />
                </Sheet>
              </Adapt>

              <Select.Content zIndex={200000}>
                <Select.ScrollUpButton />
                <Select.Viewport minWidth={200}>
                  <Select.Group>
                    <Select.Label>Ano</Select.Label>
                    {years.map((y, index) => (
                      <Select.Item key={y.value} value={y.value} index={index}>
                        <Select.ItemText>{y.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select>
          </XStack>

          <Card bordered radiused padding="$3" hoverTheme pressTheme>
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="700">
                Ano-calendário: {formattedYear}
              </Text>

              <Separator borderColor="$borderColor" />

              <Text fontSize="$3" fontWeight="600" color="$gray11">
                Receita bruta total (ano)
              </Text>
              <Text fontSize="$6" fontWeight="900">
                {convertNumberToLocaleString({
                  value: receitaBrutaTotal,
                  type: 'currency',
                })}
              </Text>

              <Text fontSize="$3" fontWeight="600" color="$gray11">
                Valor recebido (ano)
              </Text>
              <Text fontSize="$5" fontWeight="800">
                {convertNumberToLocaleString({
                  value: valorRecebido,
                  type: 'currency',
                })}
              </Text>

              <Text fontSize={12} color="$gray10Dark">
                Observação: a DASN-SIMEI pode considerar base de caixa e/ou
                outros critérios. Use este valor como referência e valide na sua
                contabilidade.
              </Text>
            </YStack>
          </Card>

          <Card bordered radiused padding="$3" hoverTheme pressTheme>
            <Text fontSize="$4" fontWeight="700" marginBottom="$2">
              Conferência por mês
            </Text>

            <YStack gap="$2">
              {byMonthWithValues.map(m => (
                <YStack
                  key={m.month}
                  padding="$2"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$4"
                >
                  <XStack justifyContent="space-between" gap="$2">
                    <Text fontWeight="700">
                      {months[m.month - 1]?.label || `Mês ${m.month}`}
                    </Text>
                    <Text fontWeight="800">
                      {convertNumberToLocaleString({
                        value: m.receitaBruta,
                        type: 'currency',
                      })}
                    </Text>
                  </XStack>
                  <Text fontSize={12} color="$gray10Dark" marginTop="$1">
                    Recebido:{' '}
                    {convertNumberToLocaleString({
                      value: m.valorRecebido,
                      type: 'currency',
                    })}
                  </Text>
                </YStack>
              ))}

              {byMonthWithValues.length === 0 && (
                <Text color="$gray10Dark">
                  Nenhuma venda encontrada para este ano.
                </Text>
              )}
            </YStack>
          </Card>

          <Card bordered radiused padding="$3" hoverTheme pressTheme>
            <Text fontSize="$4" fontWeight="700" marginBottom="$2">
              Teve empregado no ano?
            </Text>

            <ToggleGroup
              marginBottom="$3"
              backgroundColor="$background"
              orientation="horizontal"
              id="mei-employee"
              type="single"
              disableDeactivation={true}
              alignSelf="center"
              value={hadEmployee}
              onValueChange={v => setHadEmployee((v as any) || 'nao')}
            >
              <ToggleGroup.Item value="sim">
                <Text>Sim</Text>
              </ToggleGroup.Item>
              <ToggleGroup.Item value="nao">
                <Text>Não</Text>
              </ToggleGroup.Item>
            </ToggleGroup>

            {hadEmployee === 'sim' && (
              <YStack gap="$3">
                <YStack>
                  <Label fontSize={12} marginBottom={5} color="$gray11">
                    Quantidade de empregados
                  </Label>
                  <Input
                    value={employeeCount.toString()}
                    onChangeText={text => {
                      const n = Number(text.replace(/\D/g, ''));
                      setEmployeeCount(Number.isFinite(n) ? n : 0);
                    }}
                    keyboardType="numeric"
                    selectionColor="$purple"
                    borderColor="$purple4"
                    placeholder="0"
                  />
                </YStack>

                <YStack>
                  <CurrencyInput
                    value={totalRemuneration}
                    onChange={setTotalRemuneration}
                    label="Total de remuneração no ano (referência)"
                  />
                </YStack>

                <Text fontSize={12} color="$gray10Dark">
                  Preencha com base nos valores da folha/contabilidade.
                </Text>
              </YStack>
            )}

            {hadEmployee === 'nao' && (
              <Text fontSize={12} color="$gray10Dark">
                Se não houve contratação com vínculo, selecione “Não”.
              </Text>
            )}
          </Card>

          <Card bordered radiused padding="$3" hoverTheme pressTheme>
            <Text fontSize="$4" fontWeight="700" marginBottom="$2">
              Checklist rápido
            </Text>
            <YStack gap="$1">
              <Text fontSize={13}>
                1) Receita bruta do ano: use o valor calculado acima como
                referência.
              </Text>
              <Text fontSize={13}>
                2) Teve empregado: preencha conforme sua realidade (bloqueio
                manual acima).
              </Text>
              <Text fontSize={12} color="$gray10Dark">
                3) Valide na DASN-SIMEI a base/campo exato a ser preenchido.
              </Text>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
