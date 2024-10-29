import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Vendas',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Venda',
        }}
      />
    </Stack>
  );
}
