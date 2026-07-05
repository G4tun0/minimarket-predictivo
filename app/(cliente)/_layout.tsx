import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useCart } from '../../context/cart-context';

export default function ClienteLayout() {
  const { cantidadItems } = useCart();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen
        name="productos"
        options={{ title: 'Productos', tabBarIcon: () => <Text>🛍️</Text> }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: () => (
            <View>
              <Text>🛒</Text>
              {cantidadItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{cantidadItems}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{ title: 'Mis pedidos', tabBarLabel: 'Pedidos', tabBarIcon: () => <Text>📋</Text> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: () => <Text>👤</Text> }}
      />
      {/* Detalle de producto: fuera de las tabs */}
      <Tabs.Screen name="producto/[id]" options={{ href: null, title: 'Producto' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -6, right: -10, backgroundColor: '#dc2626',
    borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
