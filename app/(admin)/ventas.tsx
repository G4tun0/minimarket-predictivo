import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useProductos } from '@/hooks/use-productos';
import { useVentas } from '@/hooks/use-ventas';
import { useAuth } from '@/hooks/use-auth';
import { Producto } from '@/lib/types';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function Ventas() {
  const { productos, loading, actualizarStock } = useProductos();
  const { ventas, registrarVenta } = useVentas();
  const { session } = useAuth();

  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [guardando, setGuardando] = useState(false);

  async function confirmarVenta() {
    if (!seleccionado || !session) return;
    const cant = parseInt(cantidad, 10);
    if (!cant || cant <= 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad mayor a 0');
      return;
    }
    if (cant > seleccionado.stock_actual) {
      Alert.alert('Sin stock suficiente', `Solo quedan ${seleccionado.stock_actual} unidades`);
      return;
    }

    setGuardando(true);
    const { error } = await registrarVenta(seleccionado.id, cant, seleccionado.precio, session.user.id);
    if (!error) {
      await actualizarStock(seleccionado.id, seleccionado.stock_actual - cant);
      Alert.alert('Venta registrada', `${cant}x ${seleccionado.nombre}`);
      setSeleccionado(null);
      setCantidad('1');
    } else {
      Alert.alert('Error', 'No se pudo registrar la venta');
    }
    setGuardando(false);
  }

  if (seleccionado) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{seleccionado.nombre}</Text>
        <Text style={styles.subtitle}>Stock disponible: {seleccionado.stock_actual}</Text>
        <Text style={styles.price}>S/ {seleccionado.precio.toFixed(2)} c/u</Text>

        <Text style={styles.label}>Cantidad vendida</Text>
        <TextInput
          style={styles.input}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />

        <Pressable style={styles.button} onPress={confirmarVenta} disabled={guardando}>
          <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Confirmar venta'}</Text>
        </Pressable>
        <Pressable style={styles.cancel} onPress={() => setSeleccionado(null)}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar venta</Text>
      <Text style={styles.subtitle}>Selecciona el producto vendido</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSeleccionado(item)}>
            <View>
              <Text style={styles.cardName}>{item.nombre}</Text>
              <Text style={styles.cardMeta}>Stock: {item.stock_actual} · S/ {item.precio.toFixed(2)}</Text>
            </View>
            {item.stock_actual <= item.punto_reorden && (
              <View style={styles.badge}><Text style={styles.badgeText}>Stock bajo</Text></View>
            )}
          </Pressable>
        )}
      />

      <View style={styles.historial}>
        <Text style={styles.historialTitle}>Últimas ventas</Text>
        {ventas.slice(0, 5).map((v) => (
          <Text key={v.id} style={styles.historialItem}>
            {v.cantidad}x {v.producto?.nombre} — {v.fecha}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.margin, backgroundColor: colors.background },
  title: { ...typography.headlineMd, color: colors.onSurface, marginBottom: 4 },
  subtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: 16 },
  price: { ...typography.bodyLg, color: colors.primary, marginBottom: 24, fontWeight: '600' },
  label: { ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, color: colors.onSurface,
    fontSize: 18, textAlign: 'center', marginBottom: 24, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  buttonText: { color: colors.onPrimary, fontWeight: '600', fontSize: 16 },
  cancel: { padding: 14, alignItems: 'center' },
  cancelText: { color: colors.onSurfaceVariant },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  cardName: { ...typography.bodyLg, color: colors.onSurface, fontWeight: '600' },
  cardMeta: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: 2 },
  badge: { backgroundColor: colors.warningContainer, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { ...typography.labelMd, color: colors.onWarningContainer },
  historial: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 12 },
  historialTitle: { ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: 8 },
  historialItem: { ...typography.bodyMd, color: colors.onSurface, marginBottom: 4 },
});