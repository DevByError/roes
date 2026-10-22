import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Compass, Home, LifeBuoy, ScrollText, Megaphone, UserRound, Users, type LucideIcon } from "lucide-react-native";
import { font, useTheme } from "@/lib/theme";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { useAdminCtx } from "./data";

export interface BarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean }; navigate: (name: string) => void };
}

const META: Record<string, { label: string; icon: LucideIcon }> = {
  home: { label: "Home", icon: Home },
  index: { label: "Home", icon: Home },
  community: { label: "Community", icon: Users },
  help: { label: "Help", icon: LifeBuoy },
  explore: { label: "Explore", icon: Compass },
  notices: { label: "Notices", icon: Megaphone },
  rules: { label: "Rules", icon: ScrollText },
  inbox: { label: "Inbox", icon: Bell },
  me: { label: "Me", icon: UserRound },
};

export const TAB_SPACE = 104;

export function TabBar(props: BarProps) {
  const { unread } = useAdminCtx();
  return <FloatingBar {...props} badges={{ inbox: unread }} />;
}

export function FloatingBar({ state, navigation, badges }: BarProps & { badges: Record<string, number> }) {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: Math.max(insets.bottom, 10) + 4, alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          width: "92%",
          maxWidth: 460,
          padding: 7,
          borderRadius: 32,
          backgroundColor: isDark ? t.surface2 : t.surface,
          borderWidth: 1,
          borderColor: isDark ? t.border : "rgba(27,36,51,0.05)",
          shadowColor: t.shadow,
          shadowOpacity: isDark ? 0.5 : 0.18,
          shadowRadius: 26,
          shadowOffset: { width: 0, height: 12 },
          elevation: 14,
        }}
      >
        {state.routes.map((r, i) => (
          <Item key={r.key} name={r.name} focused={state.index === i} badge={badges[r.name] ?? 0} onPress={() => {
            const ev = navigation.emit({ type: "tabPress", target: r.key, canPreventDefault: true });
            if (!ev.defaultPrevented) navigation.navigate(r.name);
          }} />
        ))}
      </View>
    </View>
  );
}

function Item({ name, focused, badge, onPress }: { name: string; focused: boolean; badge: number; onPress: () => void }) {
  const { t, isDark } = useTheme();
  const m = META[name];
  const f = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    f.value = withSpring(focused ? 1 : 0, { damping: 18, stiffness: 220 });
  }, [focused, f]);
  const cell = useAnimatedStyle(() => ({ flexGrow: 1 + f.value * 1.5, flexBasis: 0 }));
  const box = useAnimatedStyle(() => ({ backgroundColor: focused ? t.primarySoft : "transparent" }));
  const label = useAnimatedStyle(() => ({ opacity: f.value, maxWidth: withTiming(focused ? 92 : 0, { duration: 220 }), marginLeft: withTiming(focused ? 7 : 0, { duration: 220 }) }));
  const Icon = m.icon;
  const color = focused ? t.primary : t.mute;
  return (
    <Animated.View style={cell}>
    <Tap haptic="select" scale={0.92} onPress={onPress} accessibilityLabel={m.label} accessibilityState={{ selected: focused }}>
      <Animated.View style={[{ height: 50, borderRadius: 25, flexDirection: "row", alignItems: "center", justifyContent: "center", overflow: "hidden" }, box]}>
        <View>
          <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2.1} />
          {badge > 0 && (
            <View style={{ position: "absolute", top: -6, right: -8, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: t.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 2, borderColor: isDark ? t.surface2 : t.surface }}>
              <Text style={{ fontFamily: font.heavy, fontSize: 9.5 }} color="onPrimary">{badge}</Text>
            </View>
          )}
        </View>
        <Animated.Text numberOfLines={1} style={[{ fontFamily: font.bold, fontSize: 13, color }, label]}>{m.label}</Animated.Text>
      </Animated.View>
    </Tap>
    </Animated.View>
  );
}
