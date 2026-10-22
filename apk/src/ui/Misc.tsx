import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { radius, useTheme, type Palette } from "@/lib/theme";
import { Tap } from "./Tap";
import { Text } from "./Text";

export function Card({ children, style, pad = 16, flat }: { children: ReactNode; style?: StyleProp<ViewStyle>; pad?: number; flat?: boolean }) {
  const { t, isDark } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius.lg,
          padding: pad,
          borderWidth: isDark || flat ? 1 : 0,
          borderColor: t.border,
          shadowColor: t.shadow,
          shadowOpacity: isDark || flat ? 0 : 0.07,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: isDark || flat ? 0 : 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Reveal({ i = 0, children, style }: { i?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(i, 8) * 55).duration(420).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
}

export type Tone = "primary" | "gold" | "success" | "danger" | "warn" | "info" | "neutral";
export function toneColors(t: Palette, isDark: boolean, tone: Tone): { bg: string; fg: string } {
  switch (tone) {
    case "primary": return { bg: t.primarySoft, fg: t.primaryInk };
    case "gold": return { bg: t.goldSoft, fg: t.goldInk };
    case "success": return { bg: t.successSoft, fg: t.successInk };
    case "danger": return { bg: t.dangerSoft, fg: t.danger };
    case "warn": return { bg: t.warnSoft, fg: t.warnInk };
    case "info": return { bg: t.infoSoft, fg: t.info };
    default: return { bg: t.surface2, fg: t.sub };
  }
}

export function Badge({ label, tone = "neutral", icon: Icon, dot }: { label: string; tone?: Tone; icon?: LucideIcon; dot?: boolean }) {
  const { t, isDark } = useTheme();
  const c = toneColors(t, isDark, tone);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: c.bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.fg }} />}
      {Icon && <Icon size={12} color={c.fg} strokeWidth={2.6} />}
      <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 11.5, letterSpacing: 0.1 }} color={c.fg}>{label}</Text>
    </View>
  );
}

export function Chip({ label, on, onPress, icon: Icon }: { label: string; on?: boolean; onPress?: () => void; icon?: LucideIcon }) {
  const { t, isDark } = useTheme();
  return (
    <Tap haptic="select" onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: on ? (isDark ? t.primary : t.navy) : t.surface, borderWidth: 1.5, borderColor: on ? "transparent" : t.border }} accessibilityState={{ selected: !!on }}>
      {Icon && <Icon size={15} color={on ? t.onPrimary : t.sub} />}
      <Text v="small" style={{ fontFamily: "PlusJakartaSans_700Bold" }} color={on ? "onPrimary" : "sub"}>{label}</Text>
    </Tap>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
      <Text v="heading">{title}</Text>
      {action ? (
        <Tap haptic="none" onPress={onAction} hitSlop={10}>
          <Text v="small" style={{ fontFamily: "PlusJakartaSans_700Bold" }} color={t.primary}>{action}</Text>
        </Tap>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 44, paddingHorizontal: 28 }}>
      <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: t.primarySoft, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
          <Icon size={28} color={t.primary} strokeWidth={2} />
        </View>
      </View>
      <Text v="sub" style={{ marginTop: 18, textAlign: "center" }}>{title}</Text>
      {text ? <Text v="small" color="sub" style={{ marginTop: 6, textAlign: "center", maxWidth: 280 }}>{text}</Text> : null}
      {action ? <View style={{ marginTop: 18 }}>{action}</View> : null}
    </View>
  );
}

export function Row({ icon: Icon, label, value, onPress, tone = "primary", right, danger }: { icon: LucideIcon; label: string; value?: string; onPress?: () => void; tone?: Tone; right?: ReactNode; danger?: boolean }) {
  const { t, isDark } = useTheme();
  const c = toneColors(t, isDark, danger ? "danger" : tone);
  return (
    <Tap haptic={onPress ? "light" : "none"} onPress={onPress} disabled={!onPress && !right} scale={0.985} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13 }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <Icon size={19} color={c.fg} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text v="body" style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} color={danger ? "danger" : "text"}>{label}</Text>
        {value ? <Text v="small" color="sub" style={{ marginTop: 1 }}>{value}</Text> : null}
      </View>
      {right}
    </Tap>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { t } = useTheme();
  return <View style={{ height: 1, backgroundColor: t.border, marginLeft: inset, opacity: 0.8 }} />;
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const { t } = useTheme();
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: withSpring(on ? 20 : 0, { damping: 16, stiffness: 300 }) }] }), [on]);
  const track = useAnimatedStyle(() => ({ backgroundColor: withTiming(on ? t.primary : t.border, { duration: 180 }) }), [on, t]);
  return (
    <Tap haptic="select" scale={0.94} onPress={() => onChange(!on)} accessibilityRole="switch" accessibilityState={{ checked: on }}>
      <Animated.View style={[{ width: 50, height: 30, borderRadius: 15, padding: 3 }, track]}>
        <Animated.View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 3 }, knob]} />
      </Animated.View>
    </Tap>
  );
}

export function ScreenHeader({ title, subtitle, right, eyebrow }: { title: string; subtitle?: string; right?: ReactNode; eyebrow?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 14, flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text v="label" color="primary" style={{ marginBottom: 6 }}>{eyebrow}</Text> : null}
        <Text v="title">{title}</Text>
        {subtitle ? <Text v="small" color="sub" style={{ marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
