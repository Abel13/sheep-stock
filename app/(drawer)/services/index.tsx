import { Loading } from '@/components/molecules/Loading';
import { supabase } from '@/services/supabaseClient';
import { Plus } from '@tamagui/lucide-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { YStack, Text, useTheme, Spacer, Card, XStack, Image } from 'tamagui';
import { Service } from '@/types/Service';
import { formatCurrency } from '@/utils/currency';

const fetchServices = async (search: string) => {
  let query = supabase.from('services').select('*').order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
};

const ServiceItem = memo(
  ({ item, onPress }: { item: Service; onPress: (code: string) => void }) => (
    <Card
      onPress={() => onPress(item.service_code)}
      padding="$2"
      bordered
      borderRadius="$4"
      backgroundColor="$background"
      hoverTheme
      pressTheme
    >
      <XStack gap="$3">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            width={80}
            height={80}
            borderRadius="$4"
            borderWidth={1}
            borderColor={'$borderColor'}
          />
        ) : (
          <XStack
            width={80}
            height={80}
            borderWidth={2}
            borderColor={'$borderColor'}
            backgroundColor={'$background075'}
            borderRadius={8}
          />
        )}
        <YStack flex={1}>
          <Text color="$color" fontSize={8} marginBottom="$1">
            {item.service_code}
          </Text>
          <XStack justifyContent="space-between" alignItems="center" flex={1}>
            <Text fontSize="$4" fontWeight="500">
              {item.name}
            </Text>
            <Text fontSize="$5" fontWeight={600}>
              {formatCurrency(item.price || 0)}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Card>
  ),
);

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default function ServicesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const {
    data: services,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['services_list', search],
    queryFn: () => fetchServices(search),
  });

  const handlePress = (serviceCode: string) => {
    setSearch('');
    router.push({
      pathname: `/services/new`,
      params: { id: serviceCode },
    });
  };

  return (
    <YStack
      flex={1}
      paddingHorizontal="$4"
      paddingTop="$2"
      backgroundColor="$background"
      gap={'$2'}
    >
      <Pressable
        style={[
          styles.button,
          {
            borderColor: theme.color9?.val,
            backgroundColor: theme.color5?.val,
          },
        ]}
        onPress={() =>
          router.push({
            pathname: '/(drawer)/services/new',
          })
        }
      >
        <Plus size={30} color={theme.color9?.val} />

        <YStack>
          <Text color={theme.color9?.val}>Adicionar Serviço</Text>
        </YStack>
      </Pressable>
      {isLoading ? (
        <YStack flex={1} backgroundColor="$background">
          <Loading message="Carregando..." />
        </YStack>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item: Service) => item.service_code}
          initialNumToRender={16}
          maxToRenderPerBatch={16}
          windowSize={5}
          getItemLayout={(data, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          ItemSeparatorComponent={() => <Spacer size="$2" />}
          renderItem={({ item }) => (
            <ServiceItem item={item} onPress={handlePress} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </YStack>
  );
}
