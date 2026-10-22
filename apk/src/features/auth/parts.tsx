import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { font, radius, useTheme } from "@/lib/theme";
import { passwordScore } from "@/lib/format";
import { buzz } from "@/ui/haptics";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

export function AuthHeader({ step, total, title, subtitle, onBack }: { step?: number; total?: number; title: string; subtitle?: string; onBack?: () => void }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, height: 46 }}>
        <Tap haptic="none" onPress={onBack ?? (() => router.back())} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={t.text} />
        </Tap>
        {step !== undefined && total ? (
          <View style={{ flex: 1, flexDirection: "row", gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => (
              <ProgressSeg key={i} state={i < step ? "done" : i === step ? "now" : "todo"} />
            ))}
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 22 }}>
        <Text v="title">{title}</Text>
        {subtitle ? <Text v="body" color="sub" style={{ marginTop: 8 }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function ProgressSeg({ state }: { state: "done" | "now" | "todo" }) {
  const { t } = useTheme();
  const w = useAnimatedStyle(() => ({ width: withTiming(state === "todo" ? "0%" : state === "now" ? "55%" : "100%", { duration: 380 }) }), [state]);
  return (
    <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: t.border, overflow: "hidden" }}>
      <Animated.View style={[{ height: 5, borderRadius: 3, backgroundColor: state === "done" ? t.primary : t.gold }, w]} />
    </View>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useTheme();
  const score = passwordScore(password);
  const colors = [t.danger, t.danger, t.warn, t.success, t.success];
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  const checks = [
    { ok: password.length >= 8, label: "8+ characters" },
    { ok: /[A-Z]/.test(password) && /[a-z]/.test(password), label: "Upper & lower case" },
    { ok: /\d/.test(password), label: "A number" },
  ];
  if (!password) return null;
  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ marginTop: 12, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= score ? colors[score] : t.border }} />
        ))}
        <Text v="small" style={{ marginLeft: 8, fontFamily: font.bold, width: 70, textAlign: "right" }} color={colors[score]}>{labels[score]}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        {checks.map((c) => (
          <View key={c.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: c.ok ? t.success : t.border, alignItems: "center", justifyContent: "center" }}>
              {c.ok && <Check size={11} color={t.onPrimary} strokeWidth={3.5} />}
            </View>
            <Text v="small" color={c.ok ? "text" : "mute"}>{c.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export function OtpInput({ value, onChange, error, shakeKey, onComplete, length = 6 }: { value: string; onChange: (v: string) => void; error?: boolean; shakeKey?: number; onComplete?: (v: string) => void; length?: number }) {
  const { t } = useTheme();
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const x = useSharedValue(0);
  useEffect(() => {
    if (!shakeKey) return;
    buzz("error");
    x.value = withSequence(withTiming(-10, { duration: 55 }), withTiming(10, { duration: 70 }), withTiming(-6, { duration: 60 }), withTiming(0, { duration: 60 }));
  }, [shakeKey, x]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="Verification code">
      <Animated.View style={[{ flexDirection: "row", gap: 9, justifyContent: "space-between" }, a]}>
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];
          const active = focused && i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 62,
                borderRadius: radius.md,
                backgroundColor: t.surface,
                borderWidth: 1.5,
                borderColor: error ? t.danger : active ? t.primary : ch ? t.primary + "55" : t.border,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: t.primary,
                shadowOpacity: active ? 0.2 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              <Text style={{ fontFamily: font.heavy, fontSize: 25, fontVariant: ["tabular-nums"] }}>{ch ?? ""}</Text>
              {active && !ch && <View style={{ position: "absolute", width: 2, height: 24, backgroundColor: t.primary, borderRadius: 1 }} />}
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => {
          const d = v.replace(/\D/g, "").slice(0, length);
          onChange(d);
          if (d.length === length) onComplete?.(d);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
        caretHidden
        style={{ position: "absolute", opacity: 0, height: 1, width: 1 }}
      />
    </Pressable>
  );
}

export function Resend({ onResend }: { onResend: () => void }) {
  const { t } = useTheme();
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
      <Text v="small" color="sub">Didn&apos;t get it?</Text>
      {left > 0 ? (
        <Text v="small" color="mute" style={{ fontFamily: font.bold, fontVariant: ["tabular-nums"] }}>Resend in 0:{String(left).padStart(2, "0")}</Text>
      ) : (
        <Tap haptic="light" onPress={() => { onResend(); setLeft(30); }} hitSlop={10}>
          <Text v="small" style={{ fontFamily: font.bold }} color={t.primary}>Send a new code</Text>
        </Tap>
      )}
    </View>
  );
}
