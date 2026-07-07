import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useProductos } from '../../hooks/use-productos';
import { useVentas } from '../../hooks/use-ventas';
import { calcularCriticidad, COLORES_CRITICIDAD, Criticidad } from '../../lib/types';

export default function Dashboard() {
  const { productos, cargando, recargar } = useProductos();
  const { ventas } = useVentas();

  const kpis = useMemo(() => {
    const totalProductos = productos.length;
    const sinStock = productos.filter((p) => p.stock === 0).length;
    const ingresos = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    const unidadesVendidas = ventas.reduce((acc, v) => acc + v.cantidad, 0);
    return { totalProductos, sinStock, ingresos, unidadesVendidas };
  }, [productos, ventas]);

  const alertas = useMemo(() => {
    return productos
      .map((p) => ({ p, nivel: calcularCriticidad(p.stock, p.stock_inicial) }))
      .filter((x) => x.nivel !== 'OK')
      .sort((a, b) => orden(a.nivel) - orden(b.nivel));
  }, [productos]);

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
    >
      <Text style={styles.titulo}>Resumen general</Text>

      <View style={styles.grid}>
        <Kpi label="Productos" valor={kpis.totalProductos} color="#2563eb" />
        <Kpi label="Sin stock" valor={kpis.sinStock} color="#dc2626" />
        <Kpi label="Und. vendidas" valor={kpis.unidadesVendidas} color="#16a34a" />
        <Kpi label="Ingresos" valor={`S/ ${kpis.ingresos.toFixed(2)}`} color="#7c3aed" />
      </View>

      <Text style={styles.subtitulo}>Alertas de stock ({alertas.length})</Text>
      {alertas.length === 0 && (
        <Text style={styles.vacio}>Todo el inventario esta en niveles saludables ✅</Text>
      )}
      {alertas.map(({ p, nivel }) => (
        <View key={p.id} style={styles.alerta}>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertaNombre}>{p.nombre}</Text>
            <Text style={styles.alertaStock}>
              {p.stock} / {p.stock_inicial} unidades
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORES_CRITICIDAD[nivel] }]}>
            <Text style={styles.badgeTexto}>{nivel}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function Kpi({ label, valor, color }: { label: string; valor: string | number; color: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiValor, { color }]}>{valor}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function orden(n: Criticidad) {
  return { CRITICO: 0, BAJO: 1, MEDIO: 2, OK: 3 }[n];
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  contenido: { padding: 16 },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  subtitulo: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpi: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    width: '47%', borderWidth: 1, borderColor: '#e2e8f0',
  },
  kpiValor: { fontSize: 22, fontWeight: '800' },
  kpiLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  vacio: { color: '#64748b', fontStyle: 'italic' },
  alerta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0',
  },
  alertaNombre: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  alertaStock: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeTexto: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
