import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { useLocalSearchParams } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Card,
  Spacer,
  Input,
  Button,
  useTheme,
  Separator,
  Spinner,
} from 'tamagui';
import { FlatList, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToastController } from '@tamagui/toast';
import { formatCurrency } from '@/utils/currency';
import { CurrencyFormField } from '@/components/molecules/FormField/CurrencyFormField';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SaleFormValues, saleSchema } from '@/schemas/saleSchema';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Loading } from '@/components/molecules/Loading';

const fetchSaleDetails = async ({ queryKey }: { queryKey: string[] }) => {
  const [, saleId] = queryKey;

  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .single();

  if (saleError) throw new Error(saleError.message);

  const { data: saleProducts, error: productError } = await supabase
    .from('sale_products')
    .select(
      `
      product_code,
      quantity,
      unit_price,
      total_price,
      products (product_name)
    `,
    )
    .eq('sale_id', saleId);

  const { data: saleServices, error: serviceError } = await supabase
    .from('sale_services')
    .select(
      `
      service_code,
      price,
      services (name)
    `,
    )
    .eq('sale_id', saleId);

  if (productError || serviceError) throw new Error('Falha ao buscar os itens');

  return { sale: saleData, products: saleProducts, services: saleServices };
};

const updateCustomer = async ({
  customerName,
  valuePaid,
  saleId,
}: {
  customerName: string;
  valuePaid: number;
  saleId: string;
}) => {
  const { error } = await supabase
    .from('sales')
    .update({
      customer_name: customerName,
      value_paid: valuePaid,
    })
    .eq('id', saleId);

  if (error) throw new Error(error.message);
};

export default function SaleDetails() {
  const theme = useTheme();

  const queryClient = useQueryClient();
  const toast = useToastController();

  const { id } = useLocalSearchParams();
  const saleId = id?.toString() || '';

  const { data, error, isLoading } = useQuery({
    queryKey: ['saleDetails', saleId],
    queryFn: fetchSaleDetails,
  });

  const mutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
    },
    onError: error => {
      toast.show('Erro!', {
        message: 'Falha ao salvar dados!',
      });
    },
  });

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(saleSchema),
    defaultValues: {
      customerName: '',
      valuePaid: 0,
    },
  });

  const handleSaveCustomer: SubmitHandler<SaleFormValues> = data => {
    mutation.mutate({
      customerName: data.customerName,
      valuePaid: data.valuePaid,
      saleId,
    });
  };

  const groupedSales = useMemo(() => {
    if (!data) return [];

    const services = {
      title: 'Serviços',
      totalPrice: data.services.reduce(
        (sum, service) => sum + (service.price || 0),
        0,
      ),
      data: data.services.map(item => {
        return {
          code: item.service_code || '',
          name: item.services?.name || '',
          price: item.price || 0,
          unit_price: item.price || 0,
          quantity: 1,
        };
      }),
    };

    const products = {
      title: 'Produtos',
      totalPrice: data.products.reduce(
        (sum, product) => sum + (product.unit_price || 0),
        0,
      ),
      data: data.products.map(item => {
        return {
          code: item.product_code || '',
          name: item.products?.product_name || '',
          price: item.total_price || 0,
          unit_price: item.unit_price,
          quantity: item.quantity,
        };
      }),
    };

    let group: {
      title: string;
      totalPrice: number;
      data: {
        code: string;
        name: string;
        price: number;
        quantity?: number;
        unit_price?: number;
      }[];
    }[] = [];

    if (data.products.length > 0) {
      group.push(products);
    }

    if (data.services.length > 0) {
      group.push(services);
    }

    return group;
  }, [data]);

  useEffect(() => {
    if (data) {
      setValue('customerName', data.sale.customer_name || '');
      setValue('valuePaid', data.sale.value_paid);
    }
  }, [data]);

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
        <Loading message="Carregando venda..." />
      </YStack>
    );

  if (error || !data)
    return (
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Text color="$red10">Error: {error?.message}</Text>
      </YStack>
    );

  return (
    <YStack flex={1} padding="$4" backgroundColor="$background">
      <YStack marginBottom="$4" gap={5}>
        <Text fontSize={8} marginBottom="$2">
          ID da Venda: {data.sale.id}
        </Text>
        <Text fontSize={12} fontWeight={'600'}>
          {new Date(data.sale.sale_date || '').toLocaleDateString()}
        </Text>
        <Text fontWeight={'bold'} fontSize={22}>
          Total: {formatCurrency(data.sale.total_amount)}
        </Text>
        <YStack marginTop={'$2'}>
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
          <YStack margin={10} />
          <Button onPress={handleSubmit(handleSaveCustomer)} theme={'active'}>
            <Button.Icon>
              <Ionicons name="save-outline" size={24} />
            </Button.Icon>
          </Button>
        </YStack>
      </YStack>

      <SectionList
        sections={groupedSales}
        keyExtractor={item => item.code}
        ItemSeparatorComponent={() => <Spacer size="$1" />}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <YStack paddingVertical="$3" backgroundColor={'$background'}>
            <Text fontSize="$4" fontWeight="bold" color="$color10">
              {title}
            </Text>
          </YStack>
        )}
        renderSectionFooter={({ section: { totalPrice } }) => (
          <YStack paddingVertical="$3">
            <Text
              fontSize="$4"
              color="$gray20Dark"
              textAlign="right"
              fontWeight={600}
              paddingInline="$2"
            >
              Total: {formatCurrency(totalPrice)}
            </Text>

            <Separator borderColor="$borderColor" marginTop="$2" />
          </YStack>
        )}
        renderItem={({ item }) => (
          <Card
            paddingHorizontal="$3"
            paddingVertical="$2"
            bordered
            radiused
            hoverTheme
            pressTheme
          >
            <Text color="$gray10Dark" fontSize={8}>
              {item.code}
            </Text>
            <Text fontSize={12}>{item.name}</Text>
            <XStack justifyContent="space-between" marginTop="$3">
              <YStack alignItems="center">
                <Text fontWeight={'600'}>QTD:</Text>
                <Text fontWeight={'600'}>{item.quantity}</Text>
              </YStack>
              <YStack alignItems="center">
                <Text fontWeight={'600'}>PREÇO UNIT.:</Text>
                <Text fontWeight={'600'}>
                  {formatCurrency(item.unit_price || 0)}
                </Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize="$2" color="$colorSubtle">
                  TOTAL
                </Text>
                <Text fontSize="$4" fontWeight={'600'}>
                  {formatCurrency(item.price)}
                </Text>
              </YStack>
            </XStack>
          </Card>
        )}
      />
    </YStack>
  );
}
