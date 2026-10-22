import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Building2, Camera, Check, ChevronRight, Hash, ImagePlus, Lock, Mail, Phone, Search, Sparkles, Trash2, User } from "lucide-react-native";
import { isEmail, isPhone, passwordScore } from "@/lib/format";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import { AuthHeader, OtpInput, PasswordStrength, Resend } from "@/features/auth/parts";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Badge, Chip } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";
import { toast } from "@/ui/Toast";

const TITLES = [
  { title: "Create your account", sub: "Join your building's community in a minute." },
  { title: "Where do you live?", sub: "Choose your residence so you receive its notices and rules." },
  { title: "Verify your email", sub: "Enter the 6-digit code we sent you." },
  { title: "Add a photo", sub: "Neighbors and admins will see it next to your name." },
];

export default function Register() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const places = useApp((s) => s.registerPlaces);
  const loadPlaces = useApp((s) => s.loadRegisterPlaces);
  const requestCode = useApp((s) => s.requestCode);
  const verifyCode = useApp((s) => s.verifyCode);
  const register = useApp((s) => s.register);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  const [step, setStep] = useState(0);
  const [back, setBack] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "", gender: "Female" as "Female" | "Male" });
  const [err, setErr] = useState<Record<string, string | undefined>>({});
  const [shake, setShake] = useState(0);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [unit, setUnit] = useState("");
  const [q, setQ] = useState("");
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const set = (k: keyof typeof f) => (v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    if (err[k]) setErr((e) => ({ ...e, [k]: undefined }));
  };
  const go = (n: number) => {
    setBack(n < step);
    setStep(n);
  };

  const shown = places.filter((p) => !q.trim() || `${p.name} ${p.district} ${p.category}`.toLowerCase().includes(q.trim().toLowerCase()));
  const chosen = places.find((p) => p.id === placeId);

  const next0 = async () => {
    const e: typeof err = {};
    if (f.name.trim().split(/\s+/).length < 2 || f.name.trim().length < 5) e.name = "Enter your full name";
    if (!isEmail(f.email)) e.email = "Enter a valid email address";
    if (!isPhone(f.phone)) e.phone = "Enter a valid phone number";
    if (passwordScore(f.password) < 3 || f.password.length < 8) e.password = "Use 8+ characters with upper & lower case letters and a number";
    if (!f.confirm) e.confirm = "Type your password again to confirm it";
    else if (f.confirm !== f.password) e.confirm = "Passwords don't match";
    setErr(e);
    if (Object.values(e).some(Boolean)) {
      setShake((n) => n + 1);
      return;
    }
    setBusy(true);
    const failure = await requestCode(f.email, "register");
    setBusy(false);
    if (failure) {
      setErr({ email: failure });
      setShake((n) => n + 1);
      return;
    }
    go(1);
  };

  const next1 = () => {
    if (!placeId) return toast("Choose your residence first", "error");
    if (unit.trim().length < 2) {
      setErr({ unit: "Enter your unit or house number" });
      setShake((n) => n + 1);
      return;
    }
    setErr({});
    go(2);
  };

  const verify = async (value: string) => {
    setVerifying(true);
    const failure = await verifyCode(f.email, "register", value);
    if (!failure) {
      buzz("success");
      setVerifying(false);
      go(3);
    } else {
      setVerifying(false);
      setOtpErr(true);
      setShake((n) => n + 1);
      setTimeout(() => setOtp(""), 350);
    }
  };

  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (r.canceled || !r.assets[0]) return;
    const a = r.assets[0];
    setPhoto(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
    buzz("light");
  };

  const finish = async () => {
    if (!placeId) return;
    setBusy(true);
    const { confirm: _confirm, ...account } = f;
    void _confirm;
    const failure = await register({ ...account, placeId, unit, photo, code: otp });
    setBusy(false);
    if (failure) {
      toast(failure, "error");
      return;
    }
    router.replace("/welcome");
  };

  const step0 = (
    <View style={{ gap: 14 }}>
      <Field label="Full name" icon={User} value={f.name} onChangeText={set("name")} error={err.name} shakeKey={err.name ? shake : 0} autoCapitalize="words" autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} blurOnSubmit={false} />
      <Field ref={emailRef} label="Email address" icon={Mail} value={f.email} onChangeText={set("email")} error={err.email} shakeKey={err.email ? shake : 0} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} blurOnSubmit={false} />
      <Field ref={phoneRef} label="Phone number" icon={Phone} value={f.phone} onChangeText={set("phone")} error={err.phone} shakeKey={err.phone ? shake : 0} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()} blurOnSubmit={false} hint="e.g. +60 12-345 6789" />
      <View>
        <Text v="small" color="sub" style={{ fontFamily: font.semibold, marginBottom: 8, marginLeft: 2 }}>Profile avatar style</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["Female", "Male"] as const).map((g) => (
            <Chip key={g} label={g} on={f.gender === g} onPress={() => setF((x) => ({ ...x, gender: g }))} />
          ))}
        </View>
      </View>
      <View>
        <Field ref={pwRef} label="Create a password" icon={Lock} secure value={f.password} onChangeText={set("password")} error={err.password} shakeKey={err.password ? shake : 0} autoCapitalize="none" textContentType="newPassword" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => confirmRef.current?.focus()} />
        <PasswordStrength password={f.password} />
      </View>
      <Field ref={confirmRef} label="Confirm password" icon={Lock} secure value={f.confirm} onChangeText={set("confirm")} error={err.confirm} shakeKey={err.confirm ? shake : 0} autoCapitalize="none" textContentType="newPassword" returnKeyType="go" onSubmitEditing={next0} />
    </View>
  );

  const step1 = (
    <View style={{ gap: 14 }}>
      <Field label="Search residences" icon={Search} value={q} onChangeText={setQ} autoCapitalize="none" />
      {chosen && (
        <Animated.View entering={FadeInRight.duration(300)}>
          <Field label="Unit / house number" icon={Hash} value={unit} onChangeText={(v) => { setUnit(v); if (err.unit) setErr({}); }} error={err.unit} shakeKey={err.unit ? shake : 0} autoCapitalize="characters" hint="e.g. B-12-04" returnKeyType="done" onSubmitEditing={next1} />
        </Animated.View>
      )}
      <View style={{ gap: 10 }}>
        {shown.map((p, i) => {
          const on = p.id === placeId;
          return (
            <Animated.View key={p.id} entering={FadeInRight.delay(i * 40).duration(300)}>
              <Tap
                haptic="select"
                onPress={() => setPlaceId(p.id)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.lg - 4, backgroundColor: on ? t.primarySoft : t.surface, borderWidth: 1.5, borderColor: on ? t.primary : t.border }}
                accessibilityState={{ selected: on }}
              >
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: on ? t.primary : t.surface2, alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={22} color={on ? t.onPrimary : t.sub} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text v="sub" numberOfLines={1}>{p.name}</Text>
                  <Text v="small" color="sub" style={{ marginTop: 2 }}>{p.category} · {p.district} · {p.residents} residents</Text>
                </View>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? t.primary : t.border, backgroundColor: on ? t.primary : "transparent", alignItems: "center", justifyContent: "center" }}>
                  {on && <Check size={14} color={t.onPrimary} strokeWidth={3.5} />}
                </View>
              </Tap>
            </Animated.View>
          );
        })}
        {shown.length === 0 && <Text v="small" color="sub" style={{ textAlign: "center", paddingVertical: 24 }}>No residence matches “{q}”.</Text>}
      </View>
    </View>
  );

  const step2 = (
    <View style={{ gap: 20 }}>
      <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpErr(false); }} error={otpErr} shakeKey={otpErr ? shake : 0} onComplete={verify} />
      {otpErr && <Text v="small" color="danger" style={{ textAlign: "center", fontFamily: font.semibold }}>That code isn&apos;t right. Check it and try again.</Text>}
      <Button label="Verify" onPress={() => otp.length === 6 && verify(otp)} loading={verifying} disabled={otp.length < 6} />
      <Resend onResend={async () => { setOtp(""); const failure = await requestCode(f.email, "register"); toast(failure ?? "A new code was sent", failure ? "error" : "info"); }} />
    </View>
  );

  const step3 = (
    <View style={{ alignItems: "center", gap: 20 }}>
      <View>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={{ padding: 5, borderRadius: 90, backgroundColor: t.gold }}>
          <Avatar name={f.name || "You"} gender={f.gender} photo={photo} size={150} ring={t.bg} />
        </Animated.View>
        <Tap onPress={pickPhoto} accessibilityLabel="Choose photo" style={{ position: "absolute", right: -2, bottom: 6, width: 46, height: 46, borderRadius: 23, backgroundColor: t.primary, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: t.bg }}>
          <Camera size={21} color={t.onPrimary} />
        </Tap>
      </View>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Text v="heading">{f.name || "Your name"}</Text>
        <Badge label={chosen ? `${chosen.name} · ${unit.toUpperCase()}` : "Resident"} tone="primary" icon={Building2} />
      </View>
      <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
        <View style={{ flex: 1 }}><Button label="Choose photo" variant="soft" icon={ImagePlus} size="md" onPress={pickPhoto} /></View>
        {photo ? <View style={{ flex: 1 }}><Button label="Remove" variant="danger" icon={Trash2} size="md" onPress={() => setPhoto(undefined)} /></View> : null}
      </View>
      {!photo && (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Sparkles size={15} color={t.mute} />
          <Text v="small" color="mute">No photo? We&apos;ll use this illustrated avatar for now.</Text>
        </View>
      )}
    </View>
  );

  const content = [step0, step1, step2, step3][step];
  const cta =
    step === 0 ? { label: "Continue", onPress: next0 } : step === 1 ? { label: "Continue", onPress: next1 } : step === 3 ? { label: "Create my account", onPress: finish } : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <AuthHeader step={step} total={4} title={TITLES[step].title} subtitle={TITLES[step].sub} onBack={() => (step === 0 ? router.back() : go(step - 1))} />
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 24 }}>
          <Animated.View key={step} entering={FadeInRight.duration(320).springify().damping(20)} exiting={back ? undefined : FadeOutLeft.duration(120)}>
            {content}
          </Animated.View>
        </ScrollView>
        {cta && (
          <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: t.bg }}>
            <Button label={cta.label} onPress={cta.onPress} loading={busy} iconRight={step === 3 ? undefined : ChevronRight} />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
