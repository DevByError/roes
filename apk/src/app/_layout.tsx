import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useApp } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { AppSplash } from "@/features/AppSplash";
import { ToastHost } from "@/ui/Toast";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const hydrated = useApp((s) => s.hydrated);
  const signedIn = useApp((s) => !!s.sessionId);
  const { t, isDark } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    void useApp.getState().init();
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    const tick = () => void useApp.getState().sync().catch(() => undefined);
    const timer = setInterval(tick, 20000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && tick());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [signedIn]);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: "fade" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" options={{ animation: "fade", gestureEnabled: false }} />
        </Stack>
        <ToastHost />
        {!splashDone && <AppSplash onDone={() => setSplashDone(true)} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
