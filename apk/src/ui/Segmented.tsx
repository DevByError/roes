import { useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { radius, useTheme } from "@/lib/theme";
import { Tap } from "./Tap";
import { Text } from "./Text";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  const { t, isDark } = useTheme();
  const [w, setW] = useState(0);
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  const seg = w ? (w - 8) / options.length : 0;
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: withSpring(i * seg, { damping: 20, stiffness: 260 }) }], width: seg }), [i, seg]);

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ flexDirection: "row", backgroundColor: t.surface2, borderRadius: radius.md + 2, padding: 4 }}
      accessibilityRole="tablist"
    >
      {w > 0 && (
        <Animated.View
          style={[
            { position: "absolute", top: 4, left: 4, bottom: 4, borderRadius: radius.md - 2, backgroundColor: isDark ? t.primary : t.surface, shadowColor: t.shadow, shadowOpacity: isDark ? 0 : 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
            thumb,
          ]}
        />
      )}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Tap key={o.value} haptic="select" scale={0.98} onPress={() => onChange(o.value)} style={{ flex: 1, height: 40, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }} accessibilityState={{ selected: on }}>
            <Text v="small" style={{ fontFamily: on ? "PlusJakartaSans_700Bold" : "PlusJakartaSans_600SemiBold" }} color={on ? (isDark ? "onPrimary" : "text") : "sub"}>
              {o.label}
            </Text>
            {o.count !== undefined && (
              <View style={{ minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? (isDark ? "rgba(23,25,28,0.16)" : t.primarySoft) : t.border }}>
                <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 11, fontVariant: ["tabular-nums"] }} color={on ? (isDark ? "onPrimary" : "primary") : "sub"}>{o.count}</Text>
              </View>
            )}
          </Tap>
        );
      })}
    </View>
  );
}
