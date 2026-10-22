import { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, { Easing, FadeIn, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { CrownMark } from "@/ui/Logo";
import { font, useTheme } from "@/lib/theme";

const GLOW = { light: ["#E9F0F7", "#D4D3E3"], dark: ["#1F3350", "#1B2433"] };

export function AppSplash({ onDone }: { onDone: () => void }) {
  const { t, isDark } = useTheme();
  const glow = isDark ? GLOW.dark : GLOW.light;
  const GOLD = t.gold;
  const { width, height } = useWindowDimensions();
  const crown = useSharedValue(0);
  const halo = useSharedValue(0);
  const word = useSharedValue(0);
  const tag = useSharedValue(0);
  const bar = useSharedValue(0);
  const out = useSharedValue(1);

  useEffect(() => {
    crown.value = withSpring(1, { damping: 11, stiffness: 120, mass: 0.9 });
    halo.value = withDelay(260, withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }), 2, false));
    word.value = withDelay(520, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    tag.value = withDelay(1050, withTiming(1, { duration: 600 }));
    bar.value = withDelay(300, withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) }));
    out.value = withDelay(2450, withTiming(0, { duration: 420 }, (done) => {
      if (done) runOnJS(onDone)();
    }));
  }, []);

  const root = useAnimatedStyle(() => ({ opacity: out.value, transform: [{ scale: interpolate(out.value, [0, 1], [1.04, 1]) }] }));
  const crownS = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(crown.value, [0, 1], [0.78, 1]) }, { translateY: interpolate(crown.value, [0, 1], [10, 0]) }] }));
  const haloS = useAnimatedStyle(() => ({ opacity: interpolate(halo.value, [0, 0.2, 1], [0, 0.55, 0]), transform: [{ scale: interpolate(halo.value, [0, 1], [0.55, 2.4]) }] }));
  const wordS = useAnimatedStyle(() => ({ opacity: word.value, letterSpacing: interpolate(word.value, [0, 1], [18, 9]), transform: [{ translateY: interpolate(word.value, [0, 1], [10, 0]) }] }));
  const tagS = useAnimatedStyle(() => ({ opacity: tag.value, transform: [{ translateY: interpolate(tag.value, [0, 1], [8, 0]) }] }));
  const barS = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  const R = Math.max(width, height);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: t.launch, zIndex: 1000 }, root]} pointerEvents="auto">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="46%" r="60%">
            <Stop offset="0" stopColor={glow[0]} stopOpacity={0.55} />
            <Stop offset="0.55" stopColor={glow[1]} stopOpacity={0.35} />
            <Stop offset="1" stopColor={t.launch} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={width / 2} cy={height * 0.46} r={R * 0.7} fill="url(#glow)" />
        {[0.2, 0.34, 0.5].map((k, i) => (
          <Circle key={i} cx={width / 2} cy={height * 0.46} r={R * k * 0.62} stroke={t.launchInk} strokeOpacity={0.06} strokeWidth={1} fill="none" />
        ))}
      </Svg>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 30 }}>
        <View style={{ alignItems: "center", justifyContent: "center", width: 220, height: 220 }}>
          <Animated.View style={[{ position: "absolute", width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: GOLD }, haloS]} />
          <Animated.View style={crownS}>
            <View style={{ width: 124, height: 124, borderRadius: 35, overflow: "hidden" }}><CrownMark size={124} /></View>
          </Animated.View>
        </View>
        <Animated.Text style={[{ fontFamily: font.heavy, fontSize: 38, color: t.launchInk, marginTop: 4, paddingLeft: 9 }, wordS]}>ROES</Animated.Text>
        <Animated.Text style={[{ fontFamily: font.semibold, fontSize: 12, color: isDark ? "rgba(242,244,248,0.7)" : "#4A5262", letterSpacing: 2.4, marginTop: 12, textTransform: "uppercase" }, tagS]}>
          Royal Organizing Ecosystem
        </Animated.Text>
      </View>

      <Animated.View entering={FadeIn.delay(700)} style={{ position: "absolute", bottom: 54, alignSelf: "center", width: 110, height: 3, borderRadius: 2, backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(27,36,51,0.12)", overflow: "hidden" }}>
        <Animated.View style={[{ height: 3, borderRadius: 2, backgroundColor: GOLD }, barS]} />
      </Animated.View>
    </Animated.View>
  );
}
