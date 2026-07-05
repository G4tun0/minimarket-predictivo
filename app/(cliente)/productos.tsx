import { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProductos } from '@/hooks/use-productos';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function Productos() {
  const { productos, loading } = useProductos();
  const [busqueda, setBusqueda] = useState('');

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Pressable onPress={() => router.replace('/' as any)} style={styles.back}>
          <Text style={styles.backText}>← Volver al inicio</Text>
        </Pressable>

        <Text style={styles.title}>Productos disponibles</Text>

        <TextInput
          style={styles.search}
          placeholder="Buscar producto..."
          placeholderTextColor="#6B7A6F"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {loading ? 'Cargando...' : 'No se encontraron productos'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.nombre}</Text>
                <Text style={styles.cardCategoria}>{item.categoria}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardPrice}>S/ {item.precio.toFixed(2)}</Text>
                <View style={item.stock_actual > 0 ? styles.badgeOk : styles.badgeBad}>
                  <Text style={item.stock_actual > 0 ? styles.badgeOkText : styles.badgeBadText}>
                    {item.stock_actual > 0 ? 'Disponible' : 'Agotado'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.margin, paddingTop: 12 },
  back: { marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  title: { ...typography.headlineMd, color: colors.onSurface, marginBottom: 16 },
  search: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12,
    color: colors.onSurface, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  empty: { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 60, fontSize: 14 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  cardName: { ...typography.bodyLg, color: colors.onSurface, fontWeight: '600' },
  cardCategoria: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: 3 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardPrice: { ...typography.bodyLg, color: colors.onSurface, fontWeight: '700' },
  badgeOk: { backgroundColor: colors.successContainer, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOkText: { ...typography.labelMd, color: colors.onSuccessContainer },
  badgeBad: { backgroundColor: colors.errorContainer, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeBadText: { ...typography.labelMd, color: colors.onErrorContainer },
});