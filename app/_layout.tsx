import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../context/cart-context';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(cliente)" />
      </Stack>
    </CartProvider>
  );
}
