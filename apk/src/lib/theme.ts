import { useApp } from "@/lib/store";

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  sub: string;
  mute: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  gold: string;
  goldSoft: string;
  goldInk: string;
  success: string;
  successInk: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warn: string;
  warnInk: string;
  warnSoft: string;
  info: string;
  infoSoft: string;
  navy: string;
  navy2: string;
  shadow: string;
  scrim: string;
  primaryInk: string;
  lavender: string;
  focus: string;
  hover: string;
  metal: [string, string, string];
  hero: [string, string];
  heroAdmin: [string, string];
  authGrad: [string, string];
  welcomeUser: [string, string];
  welcomeAdmin: [string, string];
  splash: string;
  launch: string;
  launchInk: string;
  logo: [string, string];
  callout: string;
  calloutBorder: string;
  calloutInk: string;
  giving: [string, string];
  givingInk: string;
  givingBig: string;
  barMuted: string;
  emergency: string;
  mapRes: string;
  mapPublic: string;
  onMap: string;
  mapTint: string;
}

export const light: Palette = {
  bg: "#FCFBF9",
  surface: "#FFFFFF",
  surface2: "#ECEBF3",
  border: "#D4D3E3",
  text: "#1B2433",
  sub: "#5F6670",
  mute: "#6F7580",
  primary: "#2665AE",
  primarySoft: "#E9F0F7",
  onPrimary: "#FFFFFF",
  gold: "#FE9169",
  goldSoft: "#FFEEE8",
  goldInk: "#8A3A1A",
  success: "#159B80",
  successInk: "#0B6B57",
  successSoft: "#E3F3F0",
  danger: "#D1304A",
  dangerSoft: "#FFE5EA",
  warn: "#FE9169",
  warnInk: "#8A3A1A",
  warnSoft: "#FFEEE8",
  info: "#2665AE",
  infoSoft: "#E9F0F7",
  navy: "#1B2433",
  navy2: "#1F4F8C",
  shadow: "#1B2433",
  scrim: "rgba(27,36,51,0.55)",
  primaryInk: "#2665AE",
  lavender: "#D4D3E3",
  focus: "#2665AE",
  hover: "rgba(38,101,174,0.08)",
  metal: ["#FE9169", "#FE9169", "#FE9169"],
  hero: ["#2665AE", "#1F4F8C"],
  heroAdmin: ["#2665AE", "#1B2433"],
  authGrad: ["#2665AE", "#1B2433"],
  welcomeUser: ["#2665AE", "#1B2A44"],
  welcomeAdmin: ["#1F4F8C", "#1B2433"],
  splash: "#1B2433",
  launch: "#D4D3E3",
  launchInk: "#1B2433",
  logo: ["#D4D3E3", "#D4D3E3"],
  callout: "#FFF3EE",
  calloutBorder: "#FFD5C4",
  calloutInk: "#8A3A1A",
  giving: ["#FFF3EE", "#FFE0D3"],
  givingInk: "#8A3A1A",
  givingBig: "#1B2433",
  barMuted: "#D4D3E3",
  emergency: "#D92D2D",
  mapRes: "#2665AE",
  mapPublic: "#159B80",
  onMap: "#FFFFFF",
  mapTint: "rgba(27,36,51,0.35)",
};

export const dark: Palette = {
  bg: "#121923",
  surface: "#1B2433",
  surface2: "#172030",
  border: "#2E3A4F",
  text: "#F2F4F8",
  sub: "#A9B2C2",
  mute: "#8F99AB",
  primary: "#5B9AE0",
  primarySoft: "#1F3350",
  onPrimary: "#0F1722",
  gold: "#FE9169",
  goldSoft: "#3D343B",
  goldInk: "#FFB195",
  success: "#3FBFA3",
  successInk: "#7FDAC4",
  successSoft: "#1A363F",
  danger: "#E57B7B",
  dangerSoft: "#3A2428",
  warn: "#FE9169",
  warnInk: "#FFB195",
  warnSoft: "#3D343B",
  info: "#8BB5E6",
  infoSoft: "#1E3454",
  navy: "#121923",
  navy2: "#1B2433",
  shadow: "#000000",
  scrim: "rgba(0,0,0,0.62)",
  primaryInk: "#8BB5E6",
  lavender: "#A9A8C8",
  focus: "#6FA3DE",
  hover: "rgba(91,154,224,0.14)",
  metal: ["#5B9AE0", "#5B9AE0", "#5B9AE0"],
  hero: ["#1F3350", "#1B2433"],
  heroAdmin: ["#1F3350", "#121923"],
  authGrad: ["#1F3350", "#121923"],
  welcomeUser: ["#1F3350", "#121923"],
  welcomeAdmin: ["#1B2433", "#121923"],
  splash: "#121923",
  launch: "#121923",
  launchInk: "#F2F4F8",
  logo: ["#D4D3E3", "#D4D3E3"],
  callout: "#3D343B",
  calloutBorder: "#5A423F",
  calloutInk: "#FFB195",
  giving: ["#3D343B", "#1B2433"],
  givingInk: "#FFB195",
  givingBig: "#FFB195",
  barMuted: "#2E3A4F",
  emergency: "#5B2A2B",
  mapRes: "#5B9AE0",
  mapPublic: "#3FBFA3",
  onMap: "#0F1722",
  mapTint: "rgba(18,25,35,0.62)",
};

export function useTheme() {
  const pref = useApp((s) => s.prefs.theme);
  const isDark = pref === "dark";
  return { t: isDark ? dark : light, isDark };
}

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const font = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  heavy: "PlusJakartaSans_800ExtraBold",
};
