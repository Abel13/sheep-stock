import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { useTheme } from 'tamagui';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: theme.color8?.val,
          drawerInactiveTintColor: theme.color12?.val,
          drawerStyle: {
            backgroundColor: theme.background?.val,
          },
          headerStyle: {
            backgroundColor: theme.background?.val,
          },
          headerTintColor: theme.color12?.val,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Atendimento/Venda',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="basket-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="sales"
          options={{
            title: 'Vendas',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cash-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="products"
          options={{
            title: 'Produtos',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="barcode-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="services"
          options={{
            title: 'Serviços',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="heart-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="purchases"
          options={{
            title: 'Compras',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="reports"
          options={{
            title: 'Relatórios',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="receipt-outline" color={color} size={size} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
