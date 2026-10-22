import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/lib/store";

type Kind = "light" | "medium" | "success" | "error" | "select";

export function buzz(kind: Kind = "light") {
  if (Platform.OS === "web" || !useApp.getState().prefs.haptics) return;
  try {
    if (kind === "success") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === "error") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (kind === "select") void Haptics.selectionAsync();
    else void Haptics.impactAsync(kind === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  } catch {
    return;
  }
}
