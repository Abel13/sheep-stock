import { router } from 'expo-router';
import { ListItem, ScrollView, YStack } from 'tamagui';

const reports = [
  {
    name: 'Estoque baixo',
    description: 'Produtos com estoque abaixo do mínimo.',
    route: '/reports/orders',
  },
  {
    name: 'Vendas do mês',
    description: 'Filtro de vendas por mês e ano.',
    route: '/reports/monthly',
  },
];

export default function Reports() {
  return (
    <YStack flex={1}>
      <ScrollView
        paddingHorizontal="$2"
        paddingTop="$2"
        backgroundColor="$background"
      >
        {reports.map(item => {
          return (
            <ListItem
              borderWidth={1}
              key={item.route}
              onPress={() => router.push(item.route as any)}
              title={item.name}
              subTitle={item.description}
              marginBottom={'$2'}
            />
          );
        })}
      </ScrollView>
    </YStack>
  );
}
