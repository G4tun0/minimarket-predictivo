import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useProductos } from '../../hooks/use-productos';

export default function RegistrarProducto() {
  const { crear } = useProductos();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('General');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onCrear = async () => {
    const p = parseFloat(precio);
    const s = parseInt(stock, 10);
    if (!nombre || isNaN(p) || isNaN(s)) {
      Alert.alert('Faltan datos', 'Nombre, precio y stock son obligatorios.');
      return;
    }
    setEnviando(true);
    const err = await crear({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim() || 'General',
      precio: p,
      stock: s,
      stock_inicial: s,
    });
    setEnviando(false);
    if (err) {
      Alert.alert('Error', err);
    } else {
      Alert.alert('Listo', 'Producto registrado.');
      setNombre(''); setDescripcion(''); setCategoria('General'); setPrecio(''); setStock('');
    }
  };

  return (
    <ScrollView style={styles.safe} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titulo}>Nuevo producto</Text>

      <Campo label="Nombre" value={nombre} onChangeText={setNombre} />
      <Campo label="Descripcion" value={descripcion} onChangeText={setDescripcion} />
      <Campo label="Categoria" value={categoria} onChangeText={setCategoria} />
      <Campo label="Precio (S/)" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" />
      <Campo label="Stock inicial" value={stock} onChangeText={setStock} keyboardType="number-pad" />

      <TouchableOpacity
        style={[styles.boton, enviando && { opacity: 0.6 }]}
        onPress={onCrear}
        disabled={enviando}
      >
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Registrar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Campo({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  boton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
