import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useVentas } from '../../hooks/use-ventas';
import { Prediccion } from '../../lib/types';

interface FilaReporte {
  producto: string;
  vendido: number;
  prediccion: number;
  esML: boolean;
}

export default function Reportes() {
  const { ventas, cargando, recargar } = useVentas();
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);

  const cargarPredicciones = async () => {
    const { data } = await supabase.from('predicciones').select('*');
    setPredicciones((data as Prediccion[]) ?? []);
  };

  useEffect(() => {
    cargarPredicciones();
  }, []);

  const filas: FilaReporte[] = useMemo(() => {
    // Agrupar ventas por producto
    const acumulado = new Map<string, number>();
    for (const v of ventas) {
      acumulado.set(v.producto, (acumulado.get(v.producto) ?? 0) + v.cantidad);
    }

    return Array.from(acumulado.entries())
      .map(([producto, vendido]) => {
        const pred = predicciones.find((p) => p.producto === producto);
        if (pred) {
          return { producto, vendido, prediccion: pred.prediccion, esML: true };
        }
        // Fallback: proyeccion simple x1.1 redondeada (igual que el .aia)
        return { producto, vendido, prediccion: Math.round(vendido * 1.1), esML: false };
      })
      .sort((a, b) => b.vendido - a.vendido);
  }, [ventas, predicciones]);

  const maximo = Math.max(1, ...filas.map((f) => Math.max(f.vendido, f.prediccion)));
  const hayML = filas.some((f) => f.esML);

  const onRefresh = async () => {
    await Promise.all([recargar(), cargarPredicciones()]);
  };

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>Reportes de demanda</Text>
        <View style={[styles.badge, hayML ? styles.badgeML : styles.badgeSimple]}>
          <Text style={styles.badgeTexto}>
            {hayML ? 'Modelo ML' : 'Proyeccion simple'}
          </Text>
        </View>
      </View>

      <View style={styles.leyenda}>
        <Leyenda color="#2563eb" texto="Vendido (real)" />
        <Leyenda color="#f59e0b" texto="Prediccion" />
      </View>

      {filas.length === 0 && <Text style={styles.vacio}>Aun no hay ventas registradas.</Text>}

      {filas.map((f) => (
        <View key={f.producto} style={styles.item}>
          <Text style={styles.itemNombre}>{f.producto}</Text>
          <Barra valor={f.vendido} maximo={maximo} color="#2563eb" etiqueta={`${f.vendido}`} />
          <Barra valor={f.prediccion} maximo={maximo} color="#f59e0b" etiqueta={`${f.prediccion}`} />
        </View>
      ))}
    </ScrollView>
  );
}

function Barra({ valor, maximo, color, etiqueta }: { valor: number; maximo: number; color: string; etiqueta: string }) {
  const ancho = `${Math.max(4, (valor / maximo) * 100)}%` as const;
  return (
    <View style={styles.barraFila}>
      <View style={[styles.barra, { width: ancho, backgroundColor: color }]} />
      <Text style={styles.barraTexto}>{etiqueta}</Text>
    </View>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <View style={styles.leyendaItem}>
      <View style={[styles.leyendaColor, { backgroundColor: color }]} />
      <Text style={styles.leyendaTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', flex: 1 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeML: { backgroundColor: '#16a34a' },
  badgeSimple: { backgroundColor: '#94a3b8' },
  badgeTexto: { color: '#fff', fontSize: 12, fontWeight: '700' },
  leyenda: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaColor: { width: 14, height: 14, borderRadius: 4 },
  leyendaTexto: { fontSize: 13, color: '#475569' },
  vacio: { color: '#64748b', fontStyle: 'italic' },
  item: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  itemNombre: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  barraFila: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  barra: { height: 18, borderRadius: 4 },
  barraTexto: { marginLeft: 8, fontSize: 13, color: '#475569', fontWeight: '600' },
});
