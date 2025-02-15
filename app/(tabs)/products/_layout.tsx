import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import { useTheme } from 'tamagui';

export default function ProductStackLayout() {
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
          title: 'Estoque',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Produto',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
