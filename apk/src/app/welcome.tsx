import { useEffect } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { Easing, FadeIn, FadeInDown, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { BadgeCheck, Building2, Home } from "lucide-react-native";
import { firstName } from "@/lib/format";
import { useApp, useMe } from "@/lib/store";
import { font, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";

const GOLD = "#FE9169";
const SHOW_MS = 2900;

export default function Welcome() {
  const { t, isDark } = useTheme();
  const me = useMe();
  const firstVisit = useApp((s) => s.firstVisit);
  const place = useApp((s) => s.places.find((p) => p.id === me?.placeId));
  const { width, height } = useWindowDimensions();

  const pop = useSharedValue(0);
  const ring = useSharedValue(0);
  const sweep = useSharedValue(0);
  const bar = useSharedValue(0);

  const go = () => {
    const s = useApp.getState();
    const role = s.accounts.find((a) => a.id === s.sessionId)?.role;
    s.clearFirstVisit();
    router.replace(role === "admin" ? "/admin/home" : "/user");
  };

  useEffect(() => {
    buzz("success");
    pop.value = withSpring(1, { damping: 12, stiffness: 120 });
    ring.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) }), -1, false);
    sweep.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    bar.value = withDelay(250, withTiming(1, { duration: SHOW_MS - 250, easing: Easing.linear }, (done) => {
      if (done) runOnJS(go)();
    }));
  }, []);

  const avatarS = useAnimatedStyle(() => ({ opacity: pop.value, transform: [{ scale: interpolate(pop.value, [0, 1], [0.5, 1]) }] }));
  const pulse = useAnimatedStyle(() => ({ opacity: interpolate(ring.value, [0, 0.15, 1], [0, 0.5, 0]), transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.75]) }] }));
  const barS = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  if (!me) return <Redirect href="/login" />;

  const admin = me.role === "admin";
  const R = Math.max(width, height);
  const size = 148;

  return (
    <Pressable style={{ flex: 1 }} onPress={go} accessibilityLabel="Continue">
      <StatusBar style="light" />
      <LinearGradient colors={admin ? t.welcomeAdmin : t.welcomeUser} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {[0.16, 0.28, 0.42, 0.58].map((k, i) => (
          <Circle key={i} cx={width / 2} cy={height * 0.4} r={R * k} stroke="#fff" strokeOpacity={0.06 - i * 0.01} strokeWidth={1.2} fill="none" />
        ))}
      </Svg>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingBottom: 40 }}>
        <View style={{ width: size + 60, height: size + 60, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[{ position: "absolute", width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, borderWidth: 2, borderColor: GOLD }, pulse]} />
          <Animated.View style={avatarS}>
            <View style={{ padding: 5, borderRadius: (size + 10) / 2, backgroundColor: GOLD, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 14 } }}>
              <Avatar who={me} size={size} ring={t.splash} />
            </View>
            <Animated.View entering={FadeIn.delay(650).duration(300)} style={{ position: "absolute", right: -2, bottom: 4, width: 38, height: 38, borderRadius: 19, backgroundColor: isDark ? t.surface : "#fff", alignItems: "center", justifyContent: "center" }}>
              <BadgeCheck size={24} color={t.primary} fill={t.primarySoft} />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(380).duration(560).springify().damping(16)} style={{ alignItems: "center", marginTop: 14 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 17, letterSpacing: 0.3 }} color="rgba(255,255,255,0.7)">
            {firstVisit ? "Welcome to ROES," : "Hello,"}
          </Text>
          <Text v="display" color="#fff" style={{ fontSize: 42, lineHeight: 50, marginTop: 2, textAlign: "center" }} numberOfLines={2} adjustsFontSizeToFit>
            {firstVisit ? firstName(me.name) : firstName(me.name)}
          </Text>
          {!firstVisit && <Text style={{ fontFamily: font.bold, fontSize: 20, marginTop: 8 }} color={GOLD}>welcome back</Text>}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ marginTop: 26, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.11)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" }}>
          {admin ? <Building2 size={16} color={GOLD} /> : <Home size={16} color={GOLD} />}
          <Text v="small" color="#fff" style={{ fontFamily: font.bold }}>
            {admin ? "Admin" : "Resident"}{place ? ` · ${place.name}` : ""}
          </Text>
        </Animated.View>
      </View>

      <View style={{ position: "absolute", bottom: 58, alignSelf: "center", alignItems: "center", gap: 12 }}>
        <View style={{ width: 120, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
          <Animated.View style={[{ height: 3, backgroundColor: GOLD, borderRadius: 2 }, barS]} />
        </View>
        <Text v="small" color="rgba(255,255,255,0.55)">Setting things up · tap to continue</Text>
      </View>
    </Pressable>
  );
}
