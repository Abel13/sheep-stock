import { Card, Text, YStack } from 'tamagui';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'tamagui';

interface EmptyListProps {
  icon?: keyof typeof Feather.glyphMap;
  title?: string;
  message?: string;
}

export const EmptyList = ({
  icon = 'shopping-cart',
  title = 'Nenhum item encontrado',
  message = 'Adicione itens para começar',
}: EmptyListProps) => {
  const theme = useTheme();

  return (
    <Card
      justifyContent="center"
      alignItems="center"
      padding={20}
      margin={10}
      gap={10}
    >
      <Feather name={icon} size={24} color={theme?.purple10?.val} />
      <Text marginTop={10} fontWeight="bold" color="$sage">
        {title}
      </Text>
      <Text color="$lavender">{message}</Text>
    </Card>
  );
};
