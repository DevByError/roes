import { useState } from "react";
import { Platform, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useTheme } from "@/lib/theme";
import { buzz } from "./haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const web = Platform.OS === "web";

export function Tap({
  haptic = "light",
  scale = 0.97,
  style,
  onPressIn,
  onPressOut,
  onPress,
  onFocus,
  onBlur,
  ...rest
}: Omit<PressableProps, "style"> & { haptic?: "light" | "medium" | "select" | "none"; scale?: number; style?: StyleProp<ViewStyle> }) {
  const { t, isDark } = useTheme();
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const live = !rest.disabled;
  const radius = (StyleSheet.flatten(style) as ViewStyle | undefined)?.borderRadius ?? 14;
  const extra = web
    ? ({
        cursor: live ? "pointer" : "default",
        transitionProperty: "box-shadow, filter",
        transitionDuration: "160ms",
        outlineStyle: "none",
        borderRadius: radius,
        filter: hover && live && isDark ? "brightness(1.12)" : undefined,
        boxShadow: focus && live ? `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.focus}` : undefined,
      } as unknown as ViewStyle)
    : null;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      onHoverIn={web ? () => setHover(true) : undefined}
      onHoverOut={web ? () => setHover(false) : undefined}
      onFocus={(e) => {
        if (web && (e.target as unknown as { matches?: (q: string) => boolean })?.matches?.(":focus-visible")) setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        onBlur?.(e);
      }}
      onPressIn={(e) => {
        s.value = withTiming(scale, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, { damping: 14, stiffness: 260 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic !== "none") buzz(haptic);
        onPress?.(e);
      }}
      style={[a, style, extra]}
    />
  );
}
