import React from 'react';

import { router, Stack } from 'expo-router';
import { useTheme } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background?.val,
        },
        headerTintColor: theme.color12?.val,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Pedidos',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Novo Pedido',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
