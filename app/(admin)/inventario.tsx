import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { useProductos } from '../../hooks/use-productos';
import { calcularCriticidad, COLORES_CRITICIDAD, Producto } from '../../lib/types';

export default function Inventario() {
  const { productos, cargando, recargar, actualizarStock, eliminar } = useProductos();

  return (
    <FlatList
      style={styles.safe}
      contentContainerStyle={{ padding: 16 }}
      data={productos}
      keyExtractor={(p) => String(p.id)}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
      ListHeaderComponent={<Text style={styles.titulo}>Inventario</Text>}
      renderItem={({ item }) => (
        <Fila producto={item} onGuardar={actualizarStock} onEliminar={eliminar} />
      )}
    />
  );
}

function Fila({
  producto,
  onGuardar,
  onEliminar,
}: {
  producto: Producto;
  onGuardar: (id: number, stock: number) => Promise<string | null>;
  onEliminar: (id: number) => Promise<string | null>;
}) {
  const [valor, setValor] = useState(String(producto.stock));
  const nivel = calcularCriticidad(producto.stock, producto.stock_inicial);

  const guardar = async () => {
    const n = parseInt(valor, 10);
    if (isNaN(n) || n < 0) {
      Alert.alert('Valor invalido', 'Ingresa un numero valido.');
      return;
    }
    const err = await onGuardar(producto.id, n);
    if (err) Alert.alert('Error', err);
  };

  const confirmarEliminar = () => {
    Alert.alert('Eliminar', `Eliminar "${producto.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(producto.id) },
    ]);
  };

  return (
    <View style={styles.fila}>
      <View style={styles.filaTop}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <View style={[styles.badge, { backgroundColor: COLORES_CRITICIDAD[nivel] }]}>
          <Text style={styles.badgeTexto}>{nivel}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        S/ {Number(producto.precio).toFixed(2)} · inicial {producto.stock_inicial}
      </Text>
      <View style={styles.controles}>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={valor}
          onChangeText={setValor}
        />
        <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
          <Text style={styles.botonGuardarTexto}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonEliminar} onPress={confirmarEliminar}>
          <Text style={styles.botonEliminarTexto}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  fila: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  filaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1 },
  meta: { fontSize: 13, color: '#64748b', marginTop: 2, marginBottom: 10 },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 16, width: 80, textAlign: 'center',
  },
  botonGuardar: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  botonGuardarTexto: { color: '#fff', fontWeight: '700' },
  botonEliminar: { padding: 8 },
  botonEliminarTexto: { fontSize: 18 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
