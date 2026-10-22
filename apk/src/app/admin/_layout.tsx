import { Redirect, Stack } from "expo-router";
import { useMe } from "@/lib/store";
import { useTheme } from "@/lib/theme";

export default function AdminLayout() {
  const me = useMe();
  const { t } = useTheme();
  if (!me || me.role !== "admin") return <Redirect href="/login" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
    </Stack>
  );
}
