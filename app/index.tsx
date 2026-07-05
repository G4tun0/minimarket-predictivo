import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/use-auth";
import { colors, radius, spacing, typography } from "@/constants/theme";

const DEVICE_AUTHORIZED_KEY = "device_authorized";

export default function Login() {
  const { login, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, [session]);

  async function checkBiometrics() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const authorized = await AsyncStorage.getItem(DEVICE_AUTHORIZED_KEY);
    setBiometricAvailable(hasHardware && isEnrolled && authorized === "true");
  }

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos");
      return;
    }
    await AsyncStorage.setItem(DEVICE_AUTHORIZED_KEY, "true");
    router.replace("/(admin)/dashboard" as any);
  }

  async function handleBiometric() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Ingresa con tu huella",
      fallbackLabel: "Usar contraseña",
      cancelLabel: "Cancelar",
    });
    if (result.success) {
      router.replace("/(admin)/dashboard" as any);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoAura} />
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={colors.outline}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={colors.outline}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.outline}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.outline}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </Pressable>

          {biometricAvailable && (
            <Pressable style={styles.biometric} onPress={handleBiometric}>
              <MaterialCommunityIcons
                name="fingerprint"
                size={35}
                color={colors.primary}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.clientLink}
          onPress={() => router.replace("/(cliente)/productos" as any)}
        >
          <Text style={styles.clientLinkText}>Ingresar como invitado</Text>
        </Pressable>

        <View style={styles.footerWrap}>
          <Text style={styles.footer}>Minimarket La Mar</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 90,
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoAura: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  logo: {
    width: 130,
    height: 130,
  },
  title: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 32,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 15,
    paddingVertical: 12,
  },
  error: {
    color: colors.error,
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.onPrimary, fontWeight: "600", fontSize: 16 },
  biometric: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  clientLink: { marginTop: 24, alignItems: "center" },
  clientLinkText: { color: colors.primary, fontSize: 13, fontWeight: "500" },
  footerWrap: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    alignItems: "center",
  },
  footer: {
    fontSize: 12,
    color: colors.outline,
  },
  footerVersion: {
    fontSize: 10,
    color: colors.outline,
    opacity: 0.6,
    marginTop: 2,
  },
});