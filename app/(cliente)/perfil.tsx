import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';

export default function PerfilCliente() {
  const { perfil, logout } = useAuth();

  const salir = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.nombre}>{perfil?.nombre || 'Cliente'}</Text>
        <Text style={styles.correo}>{perfil?.correo}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolTexto}>{perfil?.rol}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.botonSalir}
        onPress={() =>
          Alert.alert('Cerrar sesion', 'Seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: salir },
          ])
        }
      >
        <Text style={styles.botonSalirTexto}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0', marginTop: 12,
  },
  avatar: { fontSize: 64 },
  nombre: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginTop: 8 },
  correo: { fontSize: 14, color: '#64748b', marginTop: 4 },
  rolBadge: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 14 },
  rolTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  botonSalir: { backgroundColor: '#fee2e2', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  botonSalirTexto: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
});
