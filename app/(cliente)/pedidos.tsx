import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useVentas } from '../../hooks/use-ventas';
import { useAuth } from '../../hooks/use-auth';

export default function Pedidos() {
  const { perfil } = useAuth();
  const { ventas, cargando, recargar } = useVentas(perfil?.correo);

  return (
    <FlatList
      style={styles.safe}
      contentContainerStyle={{ padding: 16 }}
      data={ventas}
      keyExtractor={(v) => String(v.id)}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
      ListHeaderComponent={<Text style={styles.titulo}>Mis pedidos</Text>}
      ListEmptyComponent={<Text style={styles.vacio}>Aun no has hecho pedidos.</Text>}
      renderItem={({ item }) => (
        <View style={styles.fila}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>{item.producto}</Text>
            <Text style={styles.fecha}>
              {new Date(item.fecha).toLocaleDateString('es-PE', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cantidad}>x{item.cantidad}</Text>
            <Text style={styles.total}>S/ {Number(item.total).toFixed(2)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  vacio: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  fila: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0',
  },
  nombre: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  fecha: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cantidad: { fontSize: 14, color: '#475569', fontWeight: '600' },
  total: { fontSize: 16, fontWeight: '800', color: '#2563eb', marginTop: 2 },
});
