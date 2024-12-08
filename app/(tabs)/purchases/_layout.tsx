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
          title: 'Compras',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Nova Compra',
        }}
      />
    </Stack>
  );
}
