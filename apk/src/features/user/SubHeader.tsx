import type { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { font, useTheme } from "@/lib/theme";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

export function SubHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace("/user/me"))} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" }}>
        <ArrowLeft size={20} color={t.text} />
      </Tap>
      <View style={{ flex: 1 }}>
        <Text v="heading">{title}</Text>
        {subtitle ? <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
