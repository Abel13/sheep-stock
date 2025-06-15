import React from 'react';

import { router, Stack } from 'expo-router';
import { Button, useTheme, XStack, YStack, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

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
          headerShown: false,
          title: 'Relatórios',
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Estoque Baixo',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="monthly"
        options={{
          title: 'Vendas Mensais',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="best_sellers"
        options={{
          title: 'Mais Vendidos',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
