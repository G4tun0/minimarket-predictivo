import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/cart-context';
import { Producto } from '../../../lib/types';

export default function DetalleProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { agregar } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Se re-ejecuta cada vez que la pantalla gana foco, no solo cuando
  // cambia el id. Asi el stock mostrado nunca queda desactualizado
  // (ej. entrar, comprar, volver a entrar al mismo producto).
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      setCargando(true);
      supabase
        .from('productos')
        .select('*')
        .eq('id', Number(id))
        .single()
        .then(({ data }) => {
          if (!activo) return;
          setProducto(data as Producto);
          setCantidad(1); // resetea el contador al reentrar
          setCargando(false);
        });
      return () => {
        activo = false;
      };
    }, [id])
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.centro}>
        <Text>Producto no encontrado.</Text>
      </View>
    );
  }

  const subir = () => setCantidad((c) => Math.min(producto.stock, c + 1));
  const bajar = () => setCantidad((c) => Math.max(1, c - 1));

  const agregarAlCarrito = () => {
    agregar(producto, cantidad);
    Alert.alert('Agregado', `${cantidad} x ${producto.nombre} en el carrito.`, [
      { text: 'Seguir comprando', onPress: () => router.back() },
      { text: 'Ver carrito', onPress: () => router.push('/(cliente)/carrito' as any) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.contenido}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.volver}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.categoria}>{producto.categoria}</Text>
        <Text style={styles.descripcion}>{producto.descripcion || 'Sin descripcion.'}</Text>
        <Text style={styles.precio}>S/ {Number(producto.precio).toFixed(2)}</Text>
        <Text style={styles.stock}>Disponibles: {producto.stock}</Text>

        <View style={styles.contador}>
          <TouchableOpacity style={styles.botonContador} onPress={bajar}>
            <Text style={styles.botonContadorTexto}>−</Text>
          </TouchableOpacity>
          <Text style={styles.cantidad}>{cantidad}</Text>
          <TouchableOpacity style={styles.botonContador} onPress={subir}>
            <Text style={styles.botonContadorTexto}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.botonAgregar} onPress={agregarAlCarrito}>
        <Text style={styles.botonAgregarTexto}>
          Agregar · S/ {(producto.precio * cantidad).toFixed(2)}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contenido: { flex: 1, padding: 20 },
  volver: { color: '#2563eb', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  nombre: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  categoria: { fontSize: 14, color: '#64748b', marginTop: 4 },
  descripcion: { fontSize: 15, color: '#475569', marginTop: 16, lineHeight: 22 },
  precio: { fontSize: 30, fontWeight: '900', color: '#2563eb', marginTop: 20 },
  stock: { fontSize: 14, color: '#64748b', marginTop: 6 },
  contador: { flexDirection: 'row', alignItems: 'center', marginTop: 28, gap: 20 },
  botonContador: {
    backgroundColor: '#e2e8f0', width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  botonContadorTexto: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  cantidad: { fontSize: 24, fontWeight: '800', color: '#0f172a', minWidth: 40, textAlign: 'center' },
  botonAgregar: { backgroundColor: '#2563eb', margin: 20, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  botonAgregarTexto: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
