import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { AlertTriangle, ChevronRight, Lock, Mail, ShieldCheck } from "lucide-react-native";
import { useApp } from "@/lib/store";
import { isEmail } from "@/lib/format";
import { font, radius, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { LogoTile } from "@/ui/Logo";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";
import { toast } from "@/ui/Toast";

export default function Login() {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const login = useApp((s) => s.login);
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [shake, setShake] = useState(0);
  const [loading, setLoading] = useState(false);
  const pwRef = useRef<TextInput>(null);

  const submit = async () => {
    if (loading) return;
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Enter your email address";
    else if (!isEmail(email)) e.email = "That doesn't look like an email address";
    if (!password) e.password = "Enter your password";
    if (e.email || e.password) {
      setErrors(e);
      setShake((n) => n + 1);
      return;
    }
    setErrors({});
    setLoading(true);
    const r = await login(email, password);
    if (!r.ok) {
      setLoading(false);
      setShake((n) => n + 1);
      if (r.error === "not_found") setErrors({ email: "No account found with this email" });
      else if (r.error === "wrong_password") setErrors({ password: "Incorrect password. Try again or reset it." });
      else setErrors({ form: r.message });
      return;
    }
    buzz("success");
    router.replace("/welcome");
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.splash }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <LinearGradient colors={t.authGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 22, paddingHorizontal: 26, paddingBottom: 56, overflow: "hidden" }}>
            <Svg width={width} height={260} style={{ position: "absolute", right: -width * 0.35, top: -40, opacity: 0.9 }}>
              {[60, 100, 140, 180].map((r) => (
                <Circle key={r} cx={width * 0.6} cy={110} r={r} stroke="#fff" strokeOpacity={0.07} strokeWidth={1.2} fill="none" />
              ))}
            </Svg>
            <Animated.View entering={FadeIn.duration(500)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <LogoTile size={46} />
              <View>
                <Text style={{ fontFamily: font.heavy, fontSize: 18, letterSpacing: 3 }} color="#fff">ROES</Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 9.5, letterSpacing: 1.4, marginTop: 1 }} color="rgba(255,255,255,0.6)">ROYAL ORGANIZING ECOSYSTEM</Text>
              </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(120).duration(520)} style={{ marginTop: 34 }}>
              <Text v="display" color="#fff" style={{ fontSize: 36, lineHeight: 42 }}>Welcome{"\n"}back.</Text>
              <Text v="body" color="rgba(255,255,255,0.66)" style={{ marginTop: 10, maxWidth: 300 }}>
                Sign in to manage your place, your neighbors and everything in between.
              </Text>
            </Animated.View>
          </LinearGradient>

          <Animated.View
            entering={FadeInDown.delay(220).duration(520)}
            style={{ flex: 1, marginTop: -28, backgroundColor: t.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 22, paddingTop: 28, paddingBottom: insets.bottom + 24 }}
          >
            {errors.form ? (
              <View style={{ flexDirection: "row", gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: t.dangerSoft, marginBottom: 16, alignItems: "center" }}>
                <AlertTriangle size={20} color={t.danger} />
                <Text v="small" color="danger" style={{ flex: 1, fontFamily: font.semibold }}>{errors.form}</Text>
              </View>
            ) : null}

            <View style={{ gap: 14 }}>
              <Field
                label="Email address"
                icon={Mail}
                value={email}
                onChangeText={(v) => { setEmail(v); if (errors.email || errors.form) setErrors({}); }}
                error={errors.email}
                shakeKey={errors.email ? shake : 0}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => pwRef.current?.focus()}
                blurOnSubmit={false}
              />
              <Field
                ref={pwRef}
                label="Password"
                icon={Lock}
                secure
                value={password}
                onChangeText={(v) => { setPassword(v); if (errors.password) setErrors((x) => ({ ...x, password: undefined })); }}
                error={errors.password}
                shakeKey={errors.password ? shake : 0}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
              />
            </View>

            <View style={{ alignItems: "flex-end", marginTop: 14, marginBottom: 22 }}>
              <Link href="/forgot" asChild>
                <Tap haptic="light" hitSlop={10}><Text v="small" style={{ fontFamily: font.bold }} color={t.primary}>Forgot password?</Text></Tap>
              </Link>
            </View>

            <Button label="Sign in" onPress={submit} loading={loading} />

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
              <Text v="small" color="mute">New to ROES?</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
            </View>

            <Button label="Create an account" variant="outline" onPress={() => router.push("/register")} iconRight={ChevronRight} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
