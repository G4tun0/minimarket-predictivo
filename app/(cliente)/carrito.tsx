import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../../context/cart-context';
import { useAuth } from '../../hooks/use-auth';
import { registrarCompra } from '../../hooks/use-ventas';

export default function Carrito() {
  const { items, total, cambiarCantidad, quitar, vaciar } = useCart();
  const { session, perfil } = useAuth();
  const [procesando, setProcesando] = useState(false);

  const confirmarCompra = async () => {
    if (!session || !perfil) {
      Alert.alert('Sesion', 'Debes iniciar sesion.');
      return;
    }
    if (items.length === 0) return;

    setProcesando(true);
    const err = await registrarCompra(items, session.user.id, perfil.correo);
    setProcesando(false);

    if (err) {
      Alert.alert('Error al comprar', err);
    } else {
      vaciar();
      Alert.alert('Compra realizada', 'Tu pedido fue registrado con exito.', [
        { text: 'Ver mis pedidos', onPress: () => router.push('/(cliente)/pedidos' as any) },
      ]);
    }
  };

  return (
    <View style={styles.safe}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={items}
        keyExtractor={(i) => String(i.producto.id)}
        ListHeaderComponent={<Text style={styles.titulo}>Tu carrito</Text>}
        ListEmptyComponent={<Text style={styles.vacio}>El carrito esta vacio.</Text>}
        renderItem={({ item }) => (
          <View style={styles.fila}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.producto.nombre}</Text>
              <Text style={styles.precio}>
                S/ {Number(item.producto.precio).toFixed(2)} c/u
              </Text>
            </View>
            <View style={styles.contador}>
              <TouchableOpacity onPress={() => cambiarCantidad(item.producto.id, item.cantidad - 1)}>
                <Text style={styles.contadorBoton}>−</Text>
              </TouchableOpacity>
              <Text style={styles.contadorValor}>{item.cantidad}</Text>
              <TouchableOpacity
                onPress={() =>
                  cambiarCantidad(item.producto.id, Math.min(item.producto.stock, item.cantidad + 1))
                }
              >
                <Text style={styles.contadorBoton}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => quitar(item.producto.id)} style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 18 }}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValor}>S/ {total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.botonComprar, procesando && { opacity: 0.6 }]}
            onPress={confirmarCompra}
            disabled={procesando}
          >
            {procesando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonComprarTexto}>Confirmar compra</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  vacio: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  fila: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0',
  },
  nombre: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  precio: { fontSize: 13, color: '#64748b', marginTop: 2 },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contadorBoton: { fontSize: 22, fontWeight: '700', color: '#2563eb', paddingHorizontal: 6 },
  contadorValor: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  totalValor: { fontSize: 22, fontWeight: '900', color: '#2563eb' },
  botonComprar: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  botonComprarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
