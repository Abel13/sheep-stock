import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';

export default function ProductStackLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
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
          headerBackTitleVisible: true,
          headerShown: true,
        }}
      />
    </Stack>
  );
}