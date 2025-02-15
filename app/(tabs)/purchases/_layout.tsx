import React from 'react';

import { Stack } from 'expo-router';
import { useTheme } from 'tamagui';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.get(),
        },
        headerTintColor: theme.color12.get(),
      }}
    >
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
