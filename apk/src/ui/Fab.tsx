import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import { font, useTheme } from "@/lib/theme";
import { Tap } from "./Tap";
import { Text } from "./Text";

export function Fab({ label, icon: Icon, onPress }: { label: string; icon: LucideIcon; onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const { t, isDark } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(350).springify().damping(15)} style={{ position: "absolute", right: 20, bottom: Math.max(insets.bottom, 10) + 4 + 78 }} pointerEvents="box-none">
      <Tap onPress={onPress} haptic="medium" accessibilityLabel={label}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 54, paddingHorizontal: 20, borderRadius: 27, backgroundColor: t.gold, shadowColor: isDark ? t.primary : "#C96A45", shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
          <Icon size={22} color="#1B2433" strokeWidth={2.6} />
          <Text style={{ fontFamily: font.heavy, fontSize: 15 }} color="#1B2433">{label}</Text>
        </View>
      </Tap>
    </Animated.View>
  );
}
