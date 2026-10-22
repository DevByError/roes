import { type ReactNode } from "react";
import { View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as LG, Path, Polygon, RadialGradient as RG, Rect, Stop } from "react-native-svg";
import { Recycle, Trash2 } from "lucide-react-native";
import { font } from "@/lib/theme";
import { Text } from "@/ui/Text";

type Stops = (readonly [number, string, number?])[];
const H = (id: string, s: Stops) => (
  <LG id={id} x1="0" y1="0" x2="1" y2="0">
    {s.map(([o, c, op], i) => <Stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />)}
  </LG>
);
const V = (id: string, s: Stops) => (
  <LG id={id} x1="0" y1="0" x2="0" y2="1">
    {s.map(([o, c, op], i) => <Stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />)}
  </LG>
);
const Shadow = ({ rx = 28, cy = 93 }: { rx?: number; cy?: number }) => <Ellipse cx={50} cy={cy} rx={rx} ry={4.6} fill="#000" opacity={0.24} />;

export type ItemKind = "bottle" | "newspaper" | "box" | "carton" | "can" | "banana" | "pizza" | "wrapper" | "butt" | "bone";

export function ItemArt({ kind, size = 108 }: { kind: ItemKind; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {ART[kind]()}
    </Svg>
  );
}

const ART: Record<ItemKind, () => ReactNode> = {
  bottle: () => (
    <>
      <Defs>
        {H("bt", [[0, "#6B3504"], [0.28, "#D98A1E"], [0.55, "#F2B64F"], [0.82, "#C27410"], [1, "#5E2E03"]])}
        {H("bcap", [[0, "#8C949C"], [0.45, "#F4F6F8"], [1, "#7C858E"]])}
      </Defs>
      <Shadow rx={22} />
      <Path d="M43.5 13 h13 v17 c0 9 15 13 15 27 v27 c0 5-4 8-8 8 H36.5 c-4 0-8-3-8-8 V57 c0-14 15-18 15-27 Z" fill="url(#bt)" />
      <Rect x={41.5} y={5} width={17} height={10} rx={2.6} fill="url(#bcap)" />
      <Rect x={41.5} y={11.5} width={17} height={1.6} fill="#000" opacity={0.18} />
      <Rect x={28.5} y={58} width={43} height={23} fill="#F6EDD8" />
      <Rect x={28.5} y={58} width={43} height={23} fill="#000" opacity={0.06} />
      <Rect x={34} y={63} width={32} height={3.4} rx={1.7} fill="#B8741A" opacity={0.75} />
      <Rect x={38} y={69} width={24} height={2.2} rx={1.1} fill="#7A5A2A" opacity={0.5} />
      <Rect x={41} y={73.5} width={18} height={2.2} rx={1.1} fill="#7A5A2A" opacity={0.4} />
      <Path d="M34.5 62 v20" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
      <Path d="M47 18 v10" stroke="#fff" strokeOpacity={0.55} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M36 50 q-1 3 -1 7" stroke="#fff" strokeOpacity={0.4} strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </>
  ),
  newspaper: () => (
    <>
      <Defs>{V("np", [[0, "#FFFCF2"], [1, "#E3DCC8"]])}</Defs>
      <Shadow rx={30} />
      <G transform="rotate(-9 50 52)">
        <Rect x={22} y={16} width={56} height={70} rx={3} fill="#CFC8B4" />
      </G>
      <G transform="rotate(4 50 52)">
        <Rect x={22} y={13} width={56} height={72} rx={3} fill="url(#np)" />
        <Rect x={22} y={13} width={56} height={72} rx={3} fill="none" stroke="#8C866F" strokeOpacity={0.35} strokeWidth={0.8} />
        <Rect x={28} y={19} width={44} height={9} fill="#2A2F3A" />
        <Rect x={32} y={22} width={20} height={2} rx={1} fill="#F3EEDC" />
        <Rect x={28} y={32} width={30} height={3.4} rx={1.2} fill="#3F434C" />
        <Rect x={28} y={39} width={24} height={20} fill="#8FA0AE" />
        <Path d="M28 59 l8 -9 l6 6 l5 -7 l5 10 Z" fill="#5C6E7C" />
        <Circle cx={45} cy={45} r={3} fill="#F4D77A" />
        {[39, 43, 47, 51, 55].map((y) => <Rect key={y} x={55} y={y} width={17} height={2} rx={1} fill="#8E8A7C" />)}
        {[63, 67.5, 72, 76.5].map((y, i) => <Rect key={y} x={28} y={y} width={i === 3 ? 26 : 44} height={2} rx={1} fill="#9A968A" />)}
      </G>
    </>
  ),
  box: () => (
    <>
      <Shadow rx={34} />
      <Polygon points="12,40 50,58 50,94 12,76" fill="#C4913E" />
      <Polygon points="50,58 88,40 88,76 50,94" fill="#9F6E2A" />
      <Polygon points="50,22 88,40 50,58 12,40" fill="#E9C285" />
      <Polygon points="34.8,29.2 72.8,47.2 65.2,50.8 27.2,32.8" fill="#F5E4BC" opacity={0.9} />
      <Polygon points="12,40 50,58 50,94 12,76" fill="#fff" opacity={0.06} />
      <Path d="M12 40 L50 22 L88 40 L50 58 Z M50 58 V94 M12 40 V76 L50 94 L88 76 V40" fill="none" stroke="#7A511A" strokeOpacity={0.45} strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M20 54 l10 5 M20 60 l10 5" stroke="#000" strokeOpacity={0.12} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M60 72 l16 -8 M60 78 l16 -8" stroke="#000" strokeOpacity={0.14} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  carton: () => (
    <>
      <Defs>{H("cf", [[0, "#F7FAFD"], [1, "#E3EBF4"]])}</Defs>
      <Shadow rx={30} />
      <Polygon points="62,44 78,36 78,84 62,92" fill="#C9D5E3" />
      <Polygon points="28,44 62,44 62,92 28,92" fill="url(#cf)" />
      <Polygon points="28,44 62,44 58,28 32,28" fill="#EEF3F9" />
      <Polygon points="62,44 78,36 72,22 58,28" fill="#D3DEEA" />
      <Polygon points="32,28 58,28 72,22 46,22" fill="#B9C8DA" />
      <Rect x={33} y={55} width={24} height={7} rx={3.5} fill="#2F6BE0" />
      <Path d="M45 67 c-5 7 -7 10 -7 13 a7 7 0 0 0 14 0 c0-3-2-6-7-13z" fill="#2F6BE0" />
      <Path d="M42 77 a3.4 3.4 0 0 0 2.4 3.6" stroke="#fff" strokeOpacity={0.65} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Path d="M31 48 v40" stroke="#fff" strokeOpacity={0.8} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M28 44 H62 V92 H28 Z M62 44 L78 36 V84 L62 92" fill="none" stroke="#7F94AD" strokeOpacity={0.35} strokeWidth={0.8} strokeLinejoin="round" />
    </>
  ),
  can: () => (
    <>
      <Defs>
        {H("cb", [[0, "#7C130F"], [0.24, "#D8372F"], [0.45, "#FF7A70"], [0.72, "#D13028"], [1, "#6E100C"]])}
        {H("cs", [[0, "#8F98A2"], [0.4, "#F6F8FA"], [0.72, "#B7BFC8"], [1, "#7A838D"]])}
      </Defs>
      <Shadow rx={26} />
      <Path d="M28 24 v58 c0 5 10 8 22 8 s22 -3 22 -8 V24 Z" fill="url(#cb)" />
      <Path d="M28 80 c0 5 10 8 22 8 s22 -3 22 -8 v3 c0 5 -10 8 -22 8 s-22 -3 -22 -8 z" fill="url(#cs)" />
      <Path d="M28 46 q11 -7 22 0 t22 0 v15 q-11 7 -22 0 t-22 0 Z" fill="#fff" opacity={0.92} />
      <Path d="M28 46 q11 -7 22 0 t22 0 v3 q-11 -7 -22 0 t-22 0 Z" fill="#000" opacity={0.08} />
      <Circle cx={50} cy={53.5} r={4.2} fill="#D8372F" />
      <Path d="M44 56 q6 4 12 0" stroke="#fff" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Ellipse cx={50} cy={24} rx={22} ry={6.6} fill="url(#cs)" />
      <Ellipse cx={50} cy={24} rx={17.5} ry={4.4} fill="#A9B2BC" />
      <Ellipse cx={50} cy={23.4} rx={17.5} ry={3.8} fill="#C9D0D8" />
      <Path d="M43.6 22.6 h9 a2.6 2.6 0 0 1 0 5.2 h-9 a2.6 2.6 0 0 1 0 -5.2z" fill="#E4E8EC" stroke="#7F8892" strokeWidth={0.7} />
      <Rect x={33} y={30} width={3.8} height={46} rx={1.9} fill="#fff" opacity={0.38} />
    </>
  ),
  banana: () => (
    <>
      <Defs>
        {H("by", [[0, "#D99A06"], [0.35, "#F6C417"], [0.6, "#FFE76B"], [1, "#E0A609"]])}
        {V("bi", [[0, "#FFF8D2"], [1, "#EFDC90"]])}
      </Defs>
      <Shadow rx={30} cy={91} />
      <Path d="M50 24 C 26 30, 12 54, 17 84 C 28 87, 38 80, 42 66 C 46 54, 50 40, 50 24 Z" fill="url(#by)" />
      <Path d="M50 30 C 32 36, 22 56, 24 76 C 31 77, 37 72, 40 62 C 44 52, 48 42, 50 30 Z" fill="url(#bi)" />
      <Path d="M50 24 C 74 30, 88 54, 83 84 C 72 87, 62 80, 58 66 C 54 54, 50 40, 50 24 Z" fill="url(#by)" />
      <Path d="M50 30 C 68 36, 78 56, 76 76 C 69 77, 63 72, 60 62 C 56 52, 52 42, 50 30 Z" fill="url(#bi)" />
      <Path d="M50 24 C 40 46, 38 68, 50 91 C 62 68, 60 46, 50 24 Z" fill="url(#by)" />
      <Path d="M50 36 C 45 52, 44 68, 50 82 C 56 68, 55 52, 50 36 Z" fill="url(#bi)" />
      <Path d="M17 84 q1 3 5 3 M83 84 q-1 3 -5 3 M50 91 v-2" stroke="#6B3F10" strokeWidth={4.2} strokeLinecap="round" fill="none" />
      <Path d="M32 44 q-6 10 -7 20 M68 44 q6 10 7 20" stroke="#fff" strokeOpacity={0.5} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Circle cx={30} cy={70} r={1.4} fill="#8A5A14" opacity={0.7} />
      <Circle cx={70} cy={72} r={1.4} fill="#8A5A14" opacity={0.7} />
      <Circle cx={50} cy={74} r={1.2} fill="#8A5A14" opacity={0.6} />
      <Rect x={45.5} y={9} width={9} height={17} rx={3.4} fill="#7A5A22" />
      <Rect x={45.5} y={9} width={4} height={17} rx={2} fill="#fff" opacity={0.18} />
    </>
  ),
  pizza: () => (
    <>
      <Shadow rx={36} cy={88} />
      <Polygon points="10,52 50,72 50,84 10,64" fill="#D8CDB2" />
      <Polygon points="50,72 90,52 90,64 50,84" fill="#B7AA8A" />
      <Polygon points="50,30 90,52 50,72 10,52" fill="#F7F1E3" />
      <Polygon points="50,30 90,52 50,72 10,52" fill="none" stroke="#9A8F73" strokeOpacity={0.5} strokeWidth={0.9} strokeLinejoin="round" />
      <Ellipse cx={34} cy={52} rx={9} ry={4.2} fill="#B8741A" opacity={0.34} />
      <Ellipse cx={68} cy={48} rx={11} ry={4.6} fill="#B8741A" opacity={0.3} />
      <Ellipse cx={58} cy={60} rx={6} ry={2.6} fill="#B8741A" opacity={0.3} />
      <Ellipse cx={50} cy={51} rx={18} ry={8.6} fill="#D8432B" />
      <Ellipse cx={50} cy={50.4} rx={14.5} ry={6.7} fill="#F6C945" />
      <Ellipse cx={44} cy={49.6} rx={3} ry={1.4} fill="#C0321E" />
      <Ellipse cx={55} cy={51.4} rx={3} ry={1.4} fill="#C0321E" />
      <Ellipse cx={50} cy={47.6} rx={2.4} ry={1.1} fill="#C0321E" />
      <Path d="M26 44 l8 -4" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} strokeLinecap="round" />
      <Ellipse cx={22} cy={63} rx={5} ry={2} fill="#B8741A" opacity={0.28} />
    </>
  ),
  wrapper: () => (
    <>
      <Defs>
        {V("wr", [[0, "#FF8DB6"], [0.5, "#E91E63"], [1, "#A8124A"]])}
        {H("wt", [[0, "#FF6A9C"], [1, "#D81B60"]])}
      </Defs>
      <Shadow rx={26} cy={80} />
      <G transform="rotate(-18 50 50)">
        <Path d="M30 50 L7 35 Q12 50 7 65 Z" fill="url(#wt)" opacity={0.92} />
        <Path d="M70 50 L93 35 Q88 50 93 65 Z" fill="url(#wt)" opacity={0.92} />
        <Path d="M27 50 L12 42 M27 50 L11 50 M27 50 L12 58 M73 50 L88 42 M73 50 L89 50 M73 50 L88 58" stroke="#fff" strokeOpacity={0.55} strokeWidth={1} strokeLinecap="round" />
        <Ellipse cx={50} cy={50} rx={26} ry={17} fill="url(#wr)" />
        <Path d="M36 35 q-7 15 0 30" stroke="#fff" strokeOpacity={0.6} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <Path d="M50 33.5 q-4 16.5 0 33" stroke="#FFD25E" strokeOpacity={0.9} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <Path d="M64 35 q-7 15 0 30" stroke="#fff" strokeOpacity={0.6} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <Ellipse cx={44} cy={41} rx={11} ry={3.6} fill="#fff" opacity={0.42} />
      </G>
    </>
  ),
  butt: () => (
    <>
      <Defs>
        {V("cf1", [[0, "#F6C07A"], [0.5, "#DC8F33"], [1, "#A9611A"]])}
        {V("cp", [[0, "#FFFFFF"], [0.55, "#E9E9E9"], [1, "#B3B3B3"]])}
        {V("ca", [[0, "#9C9C9C"], [0.5, "#5B5B5B"], [1, "#2B2B2B"]])}
      </Defs>
      <Shadow rx={30} cy={80} />
      <G transform="rotate(-20 50 54)">
        <Rect x={13} y={45} width={28} height={19} rx={4.5} fill="url(#cf1)" />
        {[[18, 50], [24, 56], [30, 49], [35, 58], [20, 60], [33, 53]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={0.9} fill="#7A430E" opacity={0.55} />)}
        <Rect x={41} y={45} width={34} height={19} fill="url(#cp)" />
        <Rect x={40} y={45} width={2.4} height={19} fill="#8B5A1E" opacity={0.55} />
        <Path d="M75 45 h5 c5 0 8 4 8 9.5 s-3 9.5 -8 9.5 h-5 Z" fill="url(#ca)" />
        <Path d="M80 46 q4 2 4 8.5" stroke="#D9D9D9" strokeOpacity={0.4} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <Rect x={17} y={47} width={20} height={3} rx={1.5} fill="#fff" opacity={0.4} />
        <Rect x={44} y={47} width={28} height={3} rx={1.5} fill="#fff" opacity={0.9} />
        <Circle cx={69} cy={58} r={1.6} fill="#8E8E8E" opacity={0.7} />
        <Circle cx={61} cy={52} r={1.2} fill="#8E8E8E" opacity={0.5} />
      </G>
      <Path d="M80 30 c-5 -5 4 -8 -1 -14" stroke="#9AA4AE" strokeOpacity={0.5} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </>
  ),
  bone: () => (
    <>
      <Defs>
        {V("bn", [[0, "#FFFAEC"], [0.55, "#EEDFBC"], [1, "#C9B586"]])}
      </Defs>
      <Shadow rx={28} cy={84} />
      <G transform="rotate(-32 50 52)">
        <Rect x={22} y={44} width={56} height={15} rx={5} fill="url(#bn)" />
        {[[21, 41], [21, 62], [79, 41], [79, 62]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={10} fill="url(#bn)" />)}
        <Path d="M38 45 q10 -3 22 0 q3 7 -3 12 q-9 3 -19 0 q-4 -6 0 -12 Z" fill="#B65A32" />
        <Path d="M40 47 q9 -2 18 0" stroke="#E58A5E" strokeWidth={2} strokeLinecap="round" fill="none" />
        <Path d="M45 54 q6 2 11 0" stroke="#8C3F1E" strokeOpacity={0.6} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        <Path d="M16 38 q4 -5 9 -4 M16 59 q3 -2 7 -2" stroke="#fff" strokeOpacity={0.75} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M74 36 q4 -3 8 -1" stroke="#fff" strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      </G>
    </>
  ),
};

export type BinKind = "recycle" | "rubbish";
const BIN: Record<BinKind, { body: Stops; lip: string; lid: [string, string]; mouth: string }> = {
  recycle: {
    body: [[0, "#14573A"], [0.26, "#2FA874"], [0.5, "#52CB94"], [0.78, "#27895F"], [1, "#0F4530"]],
    lip: "#1E8057",
    lid: ["#3DBA85", "#1B6A47"],
    mouth: "#06241A",
  },
  rubbish: {
    body: [[0, "#1D2127"], [0.26, "#454C57"], [0.5, "#717B88"], [0.78, "#3A414B"], [1, "#15181C"]],
    lip: "#2F353D",
    lid: ["#66707C", "#2A3037"],
    mouth: "#0B0D10",
  },
};
const VBW = 120;
const VBH = 150;

function useShake(bad: SharedValue<number>) {
  return useAnimatedStyle(() => ({ transform: [{ translateX: Math.sin(bad.value * 20) * 7 * bad.value }] }));
}

export function BinBack({ kind, w, open, bad }: { kind: BinKind; w: number; open?: SharedValue<number>; bad?: SharedValue<number> }) {
  const c = BIN[kind];
  const s = w / VBW;
  const own = useSharedValue(0);
  const o = open ?? own;
  const b = bad ?? own;
  const sh = useShake(b);
  const lid = useAnimatedStyle(() => ({ transform: [{ translateY: -o.value * 15 * s }, { scaleY: 1 - o.value * 0.78 }] }));
  const halo = useAnimatedStyle(() => ({ opacity: b.value * 0.55 }));
  return (
    <Animated.View pointerEvents="none" style={[{ width: w, height: VBH * s }, sh]}>
      <Animated.View style={[{ position: "absolute", left: 16 * s, right: 16 * s, top: 46 * s, bottom: 14 * s, borderRadius: 20 * s, backgroundColor: "#E5484D", shadowColor: "#E5484D", shadowOpacity: 1, shadowRadius: 26, shadowOffset: { width: 0, height: 0 } }, halo]} />
      <Svg width={w} height={VBH * s} viewBox={`0 0 ${VBW} ${VBH}`} style={{ position: "absolute" }}>
        <Defs>
          <RG id={`${kind}-mouth`} cx="0.5" cy="0.4" rx="0.6" ry="0.6">
            <Stop offset={0} stopColor="#000" />
            <Stop offset={1} stopColor={c.mouth} />
          </RG>
          {H(`${kind}-rim`, c.body)}
        </Defs>
        <Ellipse cx={60} cy={146} rx={52} ry={6.4} fill="#000" opacity={0.32} />
        <Circle cx={30} cy={140} r={7} fill="#1B1E22" />
        <Circle cx={30} cy={140} r={2.8} fill="#6B7380" />
        <Circle cx={90} cy={140} r={7} fill="#1B1E22" />
        <Circle cx={90} cy={140} r={2.8} fill="#6B7380" />
        <Ellipse cx={60} cy={36} rx={52} ry={13} fill={`url(#${kind}-rim)`} />
        <Ellipse cx={60} cy={36.5} rx={46} ry={10} fill={`url(#${kind}-mouth)`} />
      </Svg>
      <Animated.View style={[{ position: "absolute", left: 0, top: 8 * s, width: w, height: 56 * s }, lid]}>
        <Svg width={w} height={56 * s} viewBox="0 0 120 56">
          <Defs>{H(`${kind}-lid`, [[0, c.lid[1]], [0.3, c.lid[0]], [0.55, c.lid[0], 1], [1, c.lid[1]]])}</Defs>
          <Ellipse cx={60} cy={33} rx={56} ry={14.4} fill={c.lid[1]} />
          <Ellipse cx={60} cy={28} rx={56} ry={14.4} fill={`url(#${kind}-lid)`} />
          <Ellipse cx={60} cy={26} rx={50} ry={10.6} fill="#fff" opacity={0.1} />
          <Path d="M40 24 q20 -9 40 0" stroke="#fff" strokeOpacity={0.35} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <Rect x={46} y={14} width={28} height={7} rx={3.5} fill={c.lid[1]} />
          <Rect x={46} y={12.6} width={28} height={6} rx={3} fill={c.lid[0]} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

export function BinFront({ kind, w, bad, label }: { kind: BinKind; w: number; bad?: SharedValue<number>; label?: string }) {
  const c = BIN[kind];
  const s = w / VBW;
  const own = useSharedValue(0);
  const sh = useShake(bad ?? own);
  const Icon = kind === "recycle" ? Recycle : Trash2;
  return (
    <Animated.View pointerEvents="none" style={[{ width: w, height: VBH * s }, sh]}>
      <Svg width={w} height={VBH * s} viewBox={`0 0 ${VBW} ${VBH}`} style={{ position: "absolute" }}>
        <Defs>
          {H(`${kind}-body`, c.body)}
          {V(`${kind}-shade`, [[0, "#000", 0.28], [0.18, "#000", 0], [0.8, "#000", 0], [1, "#000", 0.3]])}
        </Defs>
        <Path d="M12 38 A48 12 0 0 0 108 38 L99 131 Q98.3 138 91 138 L29 138 Q21.7 138 21 131 Z" fill={`url(#${kind}-body)`} />
        <Path d="M12 38 A48 12 0 0 0 108 38 L99 131 Q98.3 138 91 138 L29 138 Q21.7 138 21 131 Z" fill={`url(#${kind}-shade)`} />
        <Path d="M42 52 L37 128 M60 55 L60 130 M78 52 L83 128" stroke="#000" strokeOpacity={0.13} strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M27 58 L24 122" stroke="#fff" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" />
        <Path d="M8 36 A52 13 0 0 0 112 36 L112 44 A52 13 0 0 1 8 44 Z" fill={c.lip} />
        <Path d="M8 36 A52 13 0 0 0 112 36" stroke="#fff" strokeOpacity={0.3} strokeWidth={1.4} fill="none" />
        <Path d="M10 44 A50 13 0 0 0 110 44" stroke="#000" strokeOpacity={0.3} strokeWidth={1.4} fill="none" />
        <Rect x={44} y={130} width={32} height={4} rx={2} fill="#000" opacity={0.18} />
      </Svg>
      <View style={{ position: "absolute", left: 0, right: 0, top: 78 * s, alignItems: "center" }}>
        <View style={{ width: 44 * s, height: 44 * s, borderRadius: 22 * s, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.28)" }}>
          <Icon size={26 * s} color="#fff" strokeWidth={2.1} />
        </View>
        {label ? <Text style={{ marginTop: 6 * s, fontFamily: font.heavy, fontSize: Math.max(10, 11.5 * s), letterSpacing: 1.2, color: "#fff", opacity: 0.95, textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 2, textShadowOffset: { width: 0, height: 1 } }}>{label}</Text> : null}
      </View>
    </Animated.View>
  );
}

export function BinSprite({ kind, w }: { kind: BinKind; w: number }) {
  return (
    <View style={{ width: w, height: (VBH * w) / VBW }}>
      <View style={{ position: "absolute" }}><BinBack kind={kind} w={w} /></View>
      <View style={{ position: "absolute" }}><BinFront kind={kind} w={w} /></View>
    </View>
  );
}
export const binHeight = (w: number) => (VBH * w) / VBW;
