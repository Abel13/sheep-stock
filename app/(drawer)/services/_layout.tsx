import React from 'react';

import { Stack } from 'expo-router';
import { useTheme } from 'tamagui';

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
          title: 'Serviços',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'Serviço',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
