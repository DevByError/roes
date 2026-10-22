import { View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { font, radius, useTheme } from "@/lib/theme";
import { Spinner } from "./Spinner";
import { Tap } from "./Tap";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "gold" | "soft" | "ghost" | "danger" | "outline";

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon: Icon,
  iconRight: Right,
  size = "lg",
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  size?: "md" | "lg";
  style?: StyleProp<ViewStyle>;
}) {
  const { t, isDark } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: t.primary, fg: t.onPrimary },
    gold: { bg: t.gold, fg: "#1B2433" },
    soft: { bg: t.primarySoft, fg: t.primaryInk },
    ghost: { bg: "transparent", fg: t.sub },
    danger: { bg: t.dangerSoft, fg: t.danger },
    outline: { bg: "transparent", fg: t.text, border: t.border },
  };
  const p = palette[variant];
  const inactive = disabled || loading;
  const labelA = useAnimatedStyle(() => ({ opacity: withTiming(loading ? 0 : 1, { duration: 160 }), transform: [{ scale: withTiming(loading ? 0.9 : 1, { duration: 160 }) }] }), [loading]);
  const spinA = useAnimatedStyle(() => ({ opacity: withTiming(loading ? 1 : 0, { duration: 160 }), transform: [{ scale: withTiming(loading ? 1 : 0.6, { duration: 200 }) }] }), [loading]);
  const h = size === "lg" ? 56 : 46;
  const metal = isDark && variant === "primary";
  const shadow = variant === "primary" && !disabled && !isDark ? { shadowColor: t.primary, shadowOpacity: 0.32, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 } : null;

  return (
    <Tap
      onPress={inactive ? undefined : onPress}
      haptic={inactive ? "none" : "light"}
      disabled={disabled}
      accessibilityState={{ busy: !!loading, disabled: !!disabled }}
      style={[
        {
          height: h,
          borderRadius: radius.lg - 4,
          backgroundColor: p.bg,
          borderWidth: p.border ? 1.5 : 0,
          borderColor: p.border,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.45 : 1,
          paddingHorizontal: 20,
          overflow: metal ? "hidden" : "visible",
        },
        shadow,
        style,
      ]}
    >
      {metal ? <LinearGradient pointerEvents="none" colors={t.metal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} /> : null}
      <Animated.View style={[{ flexDirection: "row", alignItems: "center", gap: 9 }, labelA]}>
        {Icon && <Icon size={19} color={p.fg} strokeWidth={2.4} />}
        <Text style={{ fontFamily: font.bold, fontSize: size === "lg" ? 16 : 15, color: p.fg, letterSpacing: -0.1 }}>{label}</Text>
        {Right && <Right size={19} color={p.fg} strokeWidth={2.4} />}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[{ position: "absolute" }, spinA]}>
        <View>{loading ? <Spinner size={24} color={p.fg} /> : null}</View>
      </Animated.View>
    </Tap>
  );
}
