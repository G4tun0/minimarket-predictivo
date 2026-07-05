import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../../hooks/use-auth';

export default function AdminLayout() {
  const { logout } = useAuth();

  const confirmarSalir = () => {
    Alert.alert('Cerrar sesion', 'Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const BotonSalir = () => (
    <TouchableOpacity onPress={confirmarSalir} style={{ marginRight: 16 }}>
      <Text style={{ color: '#dc2626', fontWeight: '600' }}>Salir</Text>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        headerRight: () => <BotonSalir />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Inicio', tabBarLabel: 'Inicio', tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tabs.Screen
        name="inventario"
        options={{ title: 'Inventario', tabBarIcon: () => <Text>📦</Text> }}
      />
      <Tabs.Screen
        name="registrar-producto"
        options={{ title: 'Nuevo', tabBarLabel: 'Nuevo', tabBarIcon: () => <Text>➕</Text> }}
      />
      <Tabs.Screen
        name="reportes"
        options={{ title: 'Reportes', tabBarIcon: () => <Text>📊</Text> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tabs>
  );
}
