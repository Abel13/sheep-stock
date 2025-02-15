import { Tabs } from 'expo-router';
import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const theme = useColorScheme() || 'light';
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: Colors[theme].tabIconSelected }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nova Venda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basket-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          headerShown: false,
          title: 'Vendas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          headerShown: false,
          title: 'Estoque',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          headerShown: false,
          title: 'Compras',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Novo Pedido',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
