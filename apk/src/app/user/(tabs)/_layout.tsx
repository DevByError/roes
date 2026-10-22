import { Tabs } from "expo-router";
import { type BarProps } from "@/features/admin/TabBar";
import { UserTabBar } from "@/features/user/UserTabBar";
import { useTheme } from "@/lib/theme";

export default function UserTabs() {
  const { t } = useTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }} tabBar={(props) => <UserTabBar {...(props as unknown as BarProps)} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="help" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
