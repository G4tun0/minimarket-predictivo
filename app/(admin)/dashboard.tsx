import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProductos } from '@/hooks/use-productos';
import { useVentas } from '@/hooks/use-ventas';
import { useAuth } from '@/hooks/use-auth';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function Dashboard() {
  const { usuario } = useAuth();
  const { productos } = useProductos();
  const { ventas } = useVentas();

  const stockCritico = productos.filter((p) => p.stock_actual <= p.punto_reorden).length;
  const ventasHoy = ventas.filter((v) => v.fecha === new Date().toISOString().split('T')[0]);
  const totalHoy = ventasHoy.reduce((sum, v) => sum + v.cantidad * v.precio_unitario, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Hola, {usuario?.nombre ?? 'Administrador'}</Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>VENTAS DE HOY</Text>
            <Text style={styles.kpiValue}>S/ {totalHoy.toFixed(2)}</Text>
          </View>
          <View style={[styles.kpiCard, stockCritico > 0 && styles.kpiCardAlert]}>
            <Text style={styles.kpiLabel}>STOCK CRÍTICO</Text>
            <Text style={[styles.kpiValue, stockCritico > 0 && { color: colors.error }]}>{stockCritico} prods</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acceso rápido</Text>
        <View style={styles.grid}>
          <Pressable style={styles.gridItem} onPress={() => router.push('/(admin)/ventas' as any)}>
            <Text style={styles.gridLabel}>Registrar venta</Text>
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => router.push('/(admin)/inventario' as any)}>
            <Text style={styles.gridLabel}>Inventario</Text>
          </Pressable>
          <Pressable style={styles.gridItem} onPress={() => router.push('/(admin)/predicciones' as any)}>
            <Text style={styles.gridLabel}>Predicciones IA</Text>
          </Pressable>
          <Pressable style={styles.gridItem}>
            <Text style={styles.gridLabel}>Órdenes de compra</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Productos con stock crítico</Text>
        {productos
          .filter((p) => p.stock_actual <= p.punto_reorden)
          .map((p) => (
            <View key={p.id} style={styles.alertRow}>
              <Text style={styles.alertName}>{p.nombre}</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{p.stock_actual} unid.</Text>
              </View>
            </View>
          ))}
        {stockCritico === 0 && <Text style={styles.empty}>Sin alertas por ahora</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.margin, paddingBottom: 40 },
  greeting: { ...typography.headlineMd, color: colors.onSurface, marginBottom: 16 },
  kpiRow: { flexDirection: 'row', gap: spacing.gutter, marginBottom: 20 },
  kpiCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.cardPadding,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  kpiCardAlert: { borderColor: colors.error, backgroundColor: colors.errorContainer },
  kpiLabel: { ...typography.labelMd, color: colors.onSurfaceVariant, marginBottom: 6 },
  kpiValue: { ...typography.kpiValue, color: colors.onSurface },
  sectionTitle: { ...typography.headlineSm, color: colors.onSurface, marginTop: 8, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.gutter, marginBottom: 20 },
  gridItem: {
    width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18,
    borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', minHeight: 64, justifyContent: 'center',
  },
  gridLabel: { ...typography.bodyMd, color: colors.primary, fontWeight: '600', textAlign: 'center' },
  alertRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  alertName: { ...typography.bodyMd, color: colors.onSurface },
  alertBadge: { backgroundColor: colors.warningContainer, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  alertBadgeText: { ...typography.labelMd, color: colors.onWarningContainer },
  empty: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 },
});