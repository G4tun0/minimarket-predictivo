import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../hooks/use-auth';

export default function Registro() {
  const { registrar } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onRegistrar = async () => {
    if (!nombre || !correo || !password) {
      Alert.alert('Faltan datos', 'Completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contrasena corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    setEnviando(true);
    const err = await registrar(correo.trim(), password, nombre.trim());
    setEnviando(false);
    if (err) {
      Alert.alert('No se pudo registrar', err);
    } else {
      Alert.alert('Cuenta creada', 'Ya puedes iniciar sesion.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.contenedor}>
        <TouchableOpacity onPress={() => router.back()} style={styles.volver}>
          <Text style={styles.volverTexto}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>Registrate como cliente</Text>

        <TextInput style={styles.input} placeholder="Nombre completo" value={nombre} onChangeText={setNombre} />
        <TextInput
          style={styles.input} placeholder="Correo" autoCapitalize="none"
          keyboardType="email-address" value={correo} onChangeText={setCorreo}
        />
        <TextInput style={styles.input} placeholder="Contrasena" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity
          style={[styles.boton, enviando && { opacity: 0.6 }]}
          onPress={onRegistrar}
          disabled={enviando}
        >
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Registrarme</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  contenedor: { flex: 1, paddingHorizontal: 28, paddingTop: 12, justifyContent: 'center' },
  volver: { position: 'absolute', top: 12, left: 20 },
  volverTexto: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  titulo: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  subtitulo: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 14,
  },
  boton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
