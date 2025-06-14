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
          backgroundColor: theme.background?.val,
        },
        headerTintColor: theme.color12?.val,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Estoque',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Produto',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
