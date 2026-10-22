import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInRight, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CheckCheck, KeyRound, Lock, Mail } from "lucide-react-native";
import { isEmail, passwordScore } from "@/lib/format";
import { useApp } from "@/lib/store";
import { font, useTheme } from "@/lib/theme";
import { AuthHeader, OtpInput, PasswordStrength, Resend } from "@/features/auth/parts";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";
import { toast } from "@/ui/Toast";

const COPY = [
  { title: "Forgot password?", sub: "Enter your account email and we'll send a reset code." },
  { title: "Check your inbox", sub: "Type the 6-digit code to continue." },
  { title: "New password", sub: "Choose something you haven't used before." },
  { title: "", sub: "" },
];

export default function Forgot() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const requestCode = useApp((s) => s.requestCode);
  const verifyCode = useApp((s) => s.verifyCode);
  const resetPassword = useApp((s) => s.resetPassword);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<Record<string, string | undefined>>({});
  const [otpErr, setOtpErr] = useState(false);
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const pw2Ref = useRef<TextInput>(null);

  const sendCode = async () => {
    if (!isEmail(email)) return fail({ email: "Enter a valid email address" });
    setBusy(true);
    const failure = await requestCode(email, "reset");
    setBusy(false);
    if (failure) return fail({ email: failure });
    setErr({});
    setStep(1);
  };
  const fail = (e: typeof err) => {
    setErr(e);
    setShake((n) => n + 1);
  };
  const verify = async (v: string) => {
    setBusy(true);
    const failure = await verifyCode(email, "reset", v);
    setBusy(false);
    if (!failure) {
      buzz("success");
      setStep(2);
    } else {
      setOtpErr(true);
      setShake((n) => n + 1);
      setTimeout(() => setOtp(""), 350);
    }
  };
  const save = async () => {
    if (passwordScore(pw) < 3 || pw.length < 8) return fail({ pw: "Use 8+ characters with upper & lower case letters and a number" });
    if (pw !== pw2) return fail({ pw2: "Passwords don't match" });
    setBusy(true);
    const failure = await resetPassword(email, otp, pw);
    setBusy(false);
    if (failure) return fail({ pw: failure });
    buzz("success");
    setStep(3);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {step < 3 ? <AuthHeader step={step} total={3} title={COPY[step].title} subtitle={COPY[step].sub} onBack={() => (step === 0 ? router.back() : setStep(step - 1))} /> : <View style={{ height: insets.top + 60 }} />}
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24, flexGrow: 1 }}>
          <Animated.View key={step} entering={FadeInRight.duration(320).springify().damping(20)} style={{ flex: step === 3 ? 1 : undefined }}>
            {step === 0 && (
              <View style={{ gap: 22 }}>
                <Field label="Email address" icon={Mail} value={email} onChangeText={(v) => { setEmail(v); setErr({}); }} error={err.email} shakeKey={err.email ? shake : 0} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" returnKeyType="send" onSubmitEditing={sendCode} />
                <Button label="Send reset code" onPress={sendCode} loading={busy} />
              </View>
            )}
            {step === 1 && (
              <View style={{ gap: 20 }}>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpErr(false); }} error={otpErr} shakeKey={otpErr ? shake : 0} onComplete={verify} />
                {otpErr && <Text v="small" color="danger" style={{ textAlign: "center", fontFamily: font.semibold }}>That code isn&apos;t right. Check it and try again.</Text>}
                <Button label="Verify code" onPress={() => otp.length === 6 && verify(otp)} loading={busy} disabled={otp.length < 6} icon={KeyRound} />
                <Resend onResend={async () => { setOtp(""); const failure = await requestCode(email, "reset"); toast(failure ?? "A new code was sent", failure ? "error" : "info"); }} />
              </View>
            )}
            {step === 2 && (
              <View style={{ gap: 14 }}>
                <View>
                  <Field label="New password" icon={Lock} secure value={pw} onChangeText={(v) => { setPw(v); setErr({}); }} error={err.pw} shakeKey={err.pw ? shake : 0} autoCapitalize="none" textContentType="newPassword" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => pw2Ref.current?.focus()} />
                  <PasswordStrength password={pw} />
                </View>
                <Field ref={pw2Ref} label="Confirm new password" icon={Lock} secure value={pw2} onChangeText={(v) => { setPw2(v); setErr({}); }} error={err.pw2} shakeKey={err.pw2 ? shake : 0} autoCapitalize="none" textContentType="newPassword" returnKeyType="go" onSubmitEditing={save} />
                <View style={{ height: 6 }} />
                <Button label="Update password" onPress={save} loading={busy} />
              </View>
            )}
            {step === 3 && (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 18, paddingBottom: 60 }}>
                <Animated.View entering={ZoomIn.springify().damping(12)} style={{ width: 118, height: 118, borderRadius: 59, backgroundColor: t.successSoft, alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.success, alignItems: "center", justifyContent: "center" }}>
                    <CheckCheck size={40} color={t.onPrimary} strokeWidth={2.6} />
                  </View>
                </Animated.View>
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Text v="title">Password updated</Text>
                  <Text v="body" color="sub" style={{ textAlign: "center", maxWidth: 290 }}>You can now sign in with your new password.</Text>
                </View>
                <View style={{ width: "100%", marginTop: 12 }}>
                  <Button label="Back to sign in" onPress={() => router.replace({ pathname: "/login", params: { email } })} />
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
