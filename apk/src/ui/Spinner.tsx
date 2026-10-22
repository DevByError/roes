import { useEffect } from "react";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

export function Spinner({ size = 22, color = "#fff", stroke = 2.6 }: { size?: number; color?: string; stroke?: number }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(360, { duration: 780, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(r);
  }, [r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  const rad = (size - stroke) / 2;
  const c = 2 * Math.PI * rad;
  return (
    <Animated.View style={[{ width: size, height: size }, a]} accessibilityRole="progressbar">
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={rad} stroke={color} strokeOpacity={0.22} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={rad}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * 0.28} ${c}`}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}
