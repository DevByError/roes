import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import { font, useTheme, type Palette } from "@/lib/theme";

export type Variant = "display" | "title" | "heading" | "sub" | "body" | "small" | "label" | "num";

const V: Record<Variant, TextStyle> = {
  display: { fontFamily: font.heavy, fontSize: 34, lineHeight: 40, letterSpacing: -0.9 },
  title: { fontFamily: font.heavy, fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  heading: { fontFamily: font.bold, fontSize: 19, lineHeight: 25, letterSpacing: -0.25 },
  sub: { fontFamily: font.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: font.medium, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.9, textTransform: "uppercase" },
  num: { fontFamily: font.heavy, fontSize: 30, lineHeight: 34, letterSpacing: -0.8, fontVariant: ["tabular-nums"] },
};

export function Text({
  v = "body",
  color = "text",
  style,
  ...rest
}: TextProps & { v?: Variant; color?: keyof Palette | (string & {}) }) {
  const { t } = useTheme();
  const c = (t as unknown as Record<string, string>)[color] ?? color;
  return <RNText {...rest} style={[V[v], { color: c }, style]} />;
}
