import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Link } from 'expo-router';
import { useAuth } from '../hooks/use-auth';

export default function Login() {
  const { session, perfil, cargando, esAdmin, login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Redirige apenas hay sesion + perfil cargado
  useEffect(() => {
    if (session && perfil) {
      router.replace(esAdmin ? '/(admin)/dashboard' : '/(cliente)/productos');
    }
  }, [session, perfil, esAdmin]);

  const onLogin = async () => {
    if (!correo || !password) {
      Alert.alert('Faltan datos', 'Ingresa correo y contrasena.');
      return;
    }
    setEnviando(true);
    const err = await login(correo.trim(), password);
    setEnviando(false);
    if (err) Alert.alert('No se pudo iniciar sesion', err);
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contenedor}
      >
        <Text style={styles.logo}>🛒</Text>
        <Text style={styles.titulo}>Minimarket La Mar</Text>
        <Text style={styles.subtitulo}>Gestion predictiva de inventario</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo"
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />
        <TextInput
          style={styles.input}
          placeholder="Contrasena"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.boton, enviando && styles.botonDeshabilitado]}
          onPress={onLogin}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Iniciar sesion</Text>
          )}
        </TouchableOpacity>

        <Link href="/registro" asChild>
          <TouchableOpacity style={styles.enlace}>
            <Text style={styles.enlaceTexto}>
              No tienes cuenta? <Text style={styles.enlaceFuerte}>Registrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contenedor: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 56, textAlign: 'center' },
  titulo: { fontSize: 26, fontWeight: '700', textAlign: 'center', color: '#0f172a', marginTop: 8 },
  subtitulo: { fontSize: 14, textAlign: 'center', color: '#64748b', marginBottom: 32 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, marginBottom: 14,
  },
  boton: {
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 6,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  enlace: { marginTop: 20, alignItems: 'center' },
  enlaceTexto: { color: '#64748b', fontSize: 14 },
  enlaceFuerte: { color: '#2563eb', fontWeight: '700' },
});
