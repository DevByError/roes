import { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react-native";
import { create } from "zustand";
import { useTheme } from "@/lib/theme";
import { buzz } from "./haptics";
import { Text } from "./Text";

type Tone = "success" | "error" | "info";
interface ToastState {
  current: { id: number; message: string; tone: Tone } | null;
  show: (message: string, tone?: Tone) => void;
  hide: () => void;
}
const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (message, tone = "success") => set({ current: { id: Date.now(), message, tone } }),
  hide: () => set({ current: null }),
}));

export const toast = (message: string, tone: Tone = "success") => {
  buzz(tone === "error" ? "error" : tone === "success" ? "success" : "light");
  useToastStore.getState().show(message, tone);
};

export function ToastHost() {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const cur = useToastStore((s) => s.current);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!cur) return;
    const id = setTimeout(hide, 2800);
    return () => clearTimeout(id);
  }, [cur, hide]);

  if (!cur) return null;
  const Icon = cur.tone === "success" ? CheckCircle2 : cur.tone === "error" ? AlertTriangle : Info;
  const color = cur.tone === "success" ? t.success : cur.tone === "error" ? t.danger : t.info;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: insets.top + 10, left: 0, right: 0, alignItems: "center", zIndex: 999 }}>
      <Animated.View
        key={cur.id}
        entering={FadeInUp.springify().damping(16)}
        exiting={FadeOutUp.duration(180)}
        layout={LinearTransition}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          maxWidth: "90%",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 18,
          backgroundColor: isDark ? t.surface2 : t.navy,
          shadowColor: "#000",
          shadowOpacity: 0.28,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}
      >
        <Icon size={20} color={cur.tone === "success" ? (isDark ? t.success : "#7FDAC4") : cur.tone === "error" ? (isDark ? t.danger : "#FFB3BE") : (isDark ? t.primary : "#8BB5E6")} />
        <Text v="small" color="#fff" style={{ flexShrink: 1, fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 14 }}>{cur.message}</Text>
      </Animated.View>
    </View>
  );
}
