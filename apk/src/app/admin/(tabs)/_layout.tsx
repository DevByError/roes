import { Tabs } from "expo-router";
import { TabBar, type BarProps } from "@/features/admin/TabBar";
import { useTheme } from "@/lib/theme";

export default function AdminTabs() {
  const { t } = useTheme();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }}
      tabBar={(props) => <TabBar {...(props as unknown as BarProps)} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="notices" />
      <Tabs.Screen name="rules" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
