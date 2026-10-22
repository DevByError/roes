import { View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop, Circle, Rect } from "react-native-svg";

export function Sparkline({ data, color, width = 120, height = 44, fill = true }: { data: number[]; color: string; width?: number; height?: number; fill?: boolean }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pad = 4;
  const sx = (i: number) => pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2);
  const sy = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const pts = data.map((v, i) => [sx(i), sy(v)] as const);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  const last = pts[pts.length - 1];
  const id = `sp${color.replace("#", "")}${width}`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.3} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill && <Path d={`${d} L${last[0]} ${height} L${pts[0][0]} ${height} Z`} fill={`url(#${id})`} />}
      <Path d={d} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={3.4} fill={color} />
    </Svg>
  );
}

export function Bars({ data, color, muted, height = 72, highlightLast = true }: { data: number[]; color: string; muted: string; height?: number; highlightLast?: boolean }) {
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height, gap: 5 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, height: Math.max(5, (v / max) * height), borderRadius: 5, backgroundColor: highlightLast && i === data.length - 1 ? color : muted }} />
      ))}
    </View>
  );
}

export function Ring({ pct, size = 54, stroke = 6, color, track }: { pct: number; size?: number; stroke?: number; color: string; track: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * Math.min(Math.max(pct, 0), 1)} ${c}`} />
    </Svg>
  );
}

export { Rect };
