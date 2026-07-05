import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useProductos } from '../../hooks/use-productos';
import { Producto } from '../../lib/types';

export default function Catalogo() {
  const { productos, cargando, recargar } = useProductos();
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  return (
    <View style={styles.safe}>
      <View style={styles.buscador}>
        <TextInput
          style={styles.input}
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        data={filtrados}
        keyExtractor={(p) => String(p.id)}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        renderItem={({ item }) => <Tarjeta producto={item} />}
        ListEmptyComponent={<Text style={styles.vacio}>Sin resultados.</Text>}
      />
    </View>
  );
}

function Tarjeta({ producto }: { producto: Producto }) {
  const disponible = producto.stock > 0;
  return (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => router.push(`/(cliente)/producto/${producto.id}` as any)}
      disabled={!disponible}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.categoria}>{producto.categoria}</Text>
        <Text style={styles.precio}>S/ {Number(producto.precio).toFixed(2)}</Text>
      </View>
      <View style={[styles.stockBadge, disponible ? styles.disp : styles.agotado]}>
        <Text style={styles.stockTexto}>
          {disponible ? `Stock: ${producto.stock}` : 'Agotado'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  buscador: { padding: 16, paddingBottom: 0 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
  },
  tarjeta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0',
  },
  nombre: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  categoria: { fontSize: 13, color: '#64748b', marginTop: 2 },
  precio: { fontSize: 16, fontWeight: '800', color: '#2563eb', marginTop: 6 },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  disp: { backgroundColor: '#dcfce7' },
  agotado: { backgroundColor: '#fee2e2' },
  stockTexto: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  vacio: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
});
