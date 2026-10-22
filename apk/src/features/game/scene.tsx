import { type ReactNode, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as LG, Path, Rect, Stop } from "react-native-svg";
import { useTheme } from "@/lib/theme";

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Mover({ from, to, duration, phase = 0, bob = 0, top, flip, children }: { from: number; to: number; duration: number; phase?: number; bob?: number; top: number; flip?: boolean; children: ReactNode }) {
  const x = useSharedValue(from);
  const b = useSharedValue(0);
  useEffect(() => {
    const start = from + (to - from) * phase;
    x.value = start;
    x.value = withSequence(
      withTiming(to, { duration: Math.max(1, duration * (1 - phase)), easing: Easing.linear }),
      withRepeat(withSequence(withTiming(from, { duration: 0 }), withTiming(to, { duration, easing: Easing.linear })), -1, false),
    );
    if (bob) b.value = withRepeat(withSequence(withTiming(-bob, { duration: 130 }), withTiming(0, { duration: 130 })), -1, false);
    return () => {
      cancelAnimation(x);
      cancelAnimation(b);
    };
  }, [from, to, duration, phase, bob, x, b]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: b.value }, { scaleX: flip ? -1 : 1 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top }, st]}>{children}</Animated.View>;
}

function Drift({ w, size, top, duration, phase, children }: { w: number; size: number; top: number; duration: number; phase: number; children: ReactNode }) {
  return <Mover from={-size} to={w + 10} duration={duration} phase={phase} top={top}>{children}</Mover>;
}

const SKIN = ["#F1C9A0", "#D9A06B", "#A86C3E", "#7A4A2A"];
const SHIRT = ["#E4572E", "#F6C945", "#7B61FF", "#18A999", "#F28AAD", "#4A90E2"];

function Person({ v, f }: { v: number; f: number }) {
  const skin = SKIN[v % SKIN.length];
  const shirt = SHIRT[v % SHIRT.length];
  const hijab = v % 3 === 1;
  const pants = hijab ? shirt : "#2F3B52";
  const hair = ["#2B1B12", "#1B1B1F", "#5A3A22"][v % 3];
  return (
    <Svg width={26} height={48} viewBox="0 0 24 46">
      <Ellipse cx={12} cy={45} rx={7} ry={1.4} fill="#000" opacity={0.16} />
      {hijab ? (
        <>
          <Path d="M12 2.5 C 6.5 2.5 5.5 8 6.5 12.5 L 17.5 12.5 C 18.5 8 17.5 2.5 12 2.5 Z" fill={["#E4572E", "#7B61FF", "#18A999", "#F28AAD"][v % 4]} />
          <Circle cx={13} cy={8.5} r={3.6} fill={skin} />
        </>
      ) : (
        <>
          <Circle cx={12} cy={8} r={5.2} fill={skin} />
          <Path d="M6.7 7.8 a5.3 5.3 0 0 1 10.6 0 c-2.4-2.2-8.2-2.2-10.6 0z" fill={hair} />
        </>
      )}
      {f === 0 ? (
        <>
          <Path d="M8 16 L5.4 27 M16 16 L18.6 27" stroke={skin} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M10.4 28 L7 43 M13.6 28 L17.4 43" stroke={pants} strokeWidth={3.6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <Path d="M8 16 L9.6 27 M16 16 L14.4 27" stroke={skin} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M10.4 28 L11 43 M13.6 28 L13 43" stroke={pants} strokeWidth={3.6} strokeLinecap="round" />
        </>
      )}
      {hijab ? <Path d="M7.5 13 L5.5 33 Q12 36 18.5 33 L16.5 13 Z" fill={shirt} /> : <Rect x={7} y={13} width={10} height={16} rx={4.2} fill={shirt} />}
      <Rect x={7.5} y={14} width={3} height={13} rx={1.5} fill="#fff" opacity={0.22} />
    </Svg>
  );
}

function Dog({ f }: { f: number }) {
  return (
    <Svg width={44} height={28} viewBox="0 0 44 28">
      <Ellipse cx={22} cy={27} rx={14} ry={1.4} fill="#000" opacity={0.16} />
      <Path d={f ? "M8 12 q-6 -3 -6 -9" : "M8 12 q-6 0 -7 -6"} stroke="#9C6228" strokeWidth={3} strokeLinecap="round" fill="none" />
      {f === 0 ? (
        <Path d="M13 19 L9 26 M17 19 L19 26 M26 19 L23 26 M30 19 L34 26" stroke="#8A5320" strokeWidth={3} strokeLinecap="round" />
      ) : (
        <Path d="M13 19 L14 26 M17 19 L15 26 M26 19 L27 26 M30 19 L29 26" stroke="#8A5320" strokeWidth={3} strokeLinecap="round" />
      )}
      <Ellipse cx={21} cy={15} rx={14} ry={7.4} fill="#B7793E" />
      <Ellipse cx={19} cy={18} rx={9} ry={3.4} fill="#E8C69A" />
      <Circle cx={35} cy={9.5} r={6.2} fill="#B7793E" />
      <Rect x={37} y={9} width={7} height={5.4} rx={2.6} fill="#E8C69A" />
      <Circle cx={43} cy={10.2} r={1.5} fill="#2B1B12" />
      <Path d="M31 5 q-4 1 -3 8 q4 -1 4.6 -5z" fill="#7C4A1A" />
      <Circle cx={36} cy={7.6} r={1} fill="#2B1B12" />
    </Svg>
  );
}

function Cat({ f }: { f: number }) {
  return (
    <Svg width={38} height={26} viewBox="0 0 38 26">
      <Ellipse cx={19} cy={25} rx={12} ry={1.3} fill="#000" opacity={0.16} />
      <Path d={f ? "M7 15 q-7 -2 -4 -11" : "M7 15 q-8 2 -5 -8"} stroke="#E39A4B" strokeWidth={3} strokeLinecap="round" fill="none" />
      {f === 0 ? (
        <Path d="M11 18 L8 24 M15 18 L17 24 M23 18 L21 24 M26 18 L29 24" stroke="#C97F33" strokeWidth={2.8} strokeLinecap="round" />
      ) : (
        <Path d="M11 18 L12 24 M15 18 L14 24 M23 18 L24 24 M26 18 L25 24" stroke="#C97F33" strokeWidth={2.8} strokeLinecap="round" />
      )}
      <Ellipse cx={18} cy={14.5} rx={12} ry={6.2} fill="#E39A4B" />
      <Path d="M12 9 q1 3 0 5 M17 8.5 q1 3 0 5.6 M22 9 q1 3 0 5" stroke="#B8702A" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Circle cx={30} cy={10} r={5.4} fill="#E39A4B" />
      <Path d="M26 6.6 L26.6 1.6 L30 5z M31 5 L34 1.8 L34.6 7z" fill="#E39A4B" />
      <Circle cx={31.8} cy={9.4} r={1} fill="#2B1B12" />
      <Circle cx={34.4} cy={11.4} r={0.9} fill="#E85D75" />
    </Svg>
  );
}

function Bird({ f, c }: { f: number; c: string }) {
  return (
    <Svg width={30} height={20} viewBox="0 0 30 20">
      <Ellipse cx={14} cy={11} rx={8} ry={4.6} fill={c} />
      <Circle cx={21.5} cy={9} r={3.4} fill={c} />
      <Path d="M24.4 9 l4 1.2 l-4 1.4z" fill="#F6A21E" />
      <Circle cx={22.4} cy={8.4} r={0.8} fill="#1B1B1F" />
      <Path d="M7 11 L2 10 L6 13z" fill={c} />
      <Path d={f ? "M12 9 Q 9 1 15 1 Q 15 6 15 9z" : "M12 12 Q 9 19 15 19 Q 15 15 15 12z"} fill="#fff" opacity={0.85} />
    </Svg>
  );
}

function Car({ body, f, taxi }: { body: string; f: number; taxi?: boolean }) {
  return (
    <Svg width={78} height={36} viewBox="0 0 78 36">
      <Ellipse cx={39} cy={34} rx={34} ry={2} fill="#000" opacity={0.22} />
      <Path d="M6 28 L6 19 Q6 15 11 14.6 L18 14 L24 6 Q26 4 30 4 L50 4 Q54 4 56 6.4 L62 14 L70 15.4 Q74 16.4 74 20 L74 28 Z" fill={body} />
      <Path d="M26 7.4 L21 14 L38 14 L38 7z M41 7 L41 14 L58.6 14 L53 7.6z" fill="#BFE3F7" />
      <Path d="M26 7.4 L21 14 L38 14 L38 7z" fill="#fff" opacity={0.28} />
      <Rect x={6} y={22} width={68} height={3} fill="#000" opacity={0.12} />
      <Rect x={70} y={18} width={5} height={4.4} rx={1.6} fill="#FFE27A" />
      <Rect x={3} y={18} width={4} height={4.4} rx={1.6} fill="#E5484D" />
      {taxi ? <Rect x={34} y={0.6} width={12} height={4} rx={1.4} fill="#fff" stroke="#2B2B2B" strokeWidth={0.6} /> : null}
      {[19, 59].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={28} r={6.6} fill="#1B1D22" />
          <Circle cx={cx} cy={28} r={3} fill="#AEB6C0" />
          <Path d={f ? `M${cx} 25 v6 M${cx - 3} 28 h6` : `M${cx - 2.1} 25.9 l4.2 4.2 M${cx + 2.1} 25.9 l-4.2 4.2`} stroke="#6F7885" strokeWidth={1} />
        </G>
      ))}
    </Svg>
  );
}

function Bus({ f }: { f: number }) {
  return (
    <Svg width={112} height={44} viewBox="0 0 112 44">
      <Ellipse cx={56} cy={42} rx={50} ry={2.2} fill="#000" opacity={0.22} />
      <Rect x={4} y={4} width={104} height={34} rx={7} fill="#F6C945" />
      <Rect x={4} y={26} width={104} height={4} fill="#E4572E" />
      {[10, 28, 46, 64, 82].map((x) => <Rect key={x} x={x} y={9} width={14} height={12} rx={2.4} fill="#BFE3F7" />)}
      <Rect x={95} y={9} width={11} height={20} rx={2.6} fill="#BFE3F7" />
      <Rect x={4} y={9} width={3} height={14} fill="#fff" opacity={0.4} />
      <Rect x={102} y={30} width={6} height={5} rx={1.6} fill="#FFF3B0" />
      {[22, 84].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={37} r={6.6} fill="#1B1D22" />
          <Circle cx={cx} cy={37} r={3} fill="#AEB6C0" />
          <Path d={f ? `M${cx} 34 v6 M${cx - 3} 37 h6` : `M${cx - 2.1} 34.9 l4.2 4.2 M${cx + 2.1} 34.9 l-4.2 4.2`} stroke="#6F7885" strokeWidth={1} />
        </G>
      ))}
    </Svg>
  );
}

function Truck({ f }: { f: number }) {
  return (
    <Svg width={104} height={46} viewBox="0 0 104 46">
      <Ellipse cx={52} cy={44} rx={48} ry={2.2} fill="#000" opacity={0.22} />
      <Rect x={2} y={6} width={66} height={30} rx={6} fill="#2FA874" />
      <Rect x={2} y={28} width={66} height={4} fill="#1B7A52" />
      <Rect x={2} y={6} width={66} height={5} rx={3} fill="#52CB94" />
      <Path d="M35 14 l5 8.6 h-10z" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M68 14 L84 14 Q88 14 90.4 17.6 L98 27 Q100 29 100 32 L100 36 L68 36 Z" fill="#F6C945" />
      <Path d="M73 17 L83 17 L91 27 L73 27z" fill="#BFE3F7" />
      <Rect x={96} y={30} width={6} height={4.4} rx={1.6} fill="#FFF3B0" />
      <Rect x={0} y={30} width={4} height={4.4} rx={1.4} fill="#E5484D" />
      {[18, 52, 86].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={37} r={7} fill="#1B1D22" />
          <Circle cx={cx} cy={37} r={3.2} fill="#AEB6C0" />
          <Path d={f ? `M${cx} 34 v6 M${cx - 3} 37 h6` : `M${cx - 2.2} 34.8 l4.4 4.4 M${cx + 2.2} 34.8 l-4.4 4.4`} stroke="#6F7885" strokeWidth={1} />
        </G>
      ))}
    </Svg>
  );
}

function Tree({ s = 1, night }: { s?: number; night: boolean }) {
  return (
    <Svg width={44 * s} height={64 * s} viewBox="0 0 44 64">
      <Defs>
        <LG id="tr" x1="0" y1="0" x2="1" y2="1">
          <Stop offset={0} stopColor={night ? "#2E6A4B" : "#6FCB8E"} />
          <Stop offset={1} stopColor={night ? "#16382A" : "#2F9E63"} />
        </LG>
      </Defs>
      <Rect x={20} y={36} width={5} height={26} rx={2} fill={night ? "#3A2C22" : "#8A5A33"} />
      <Circle cx={22} cy={22} r={18} fill="url(#tr)" />
      <Circle cx={12} cy={30} r={11} fill="url(#tr)" />
      <Circle cx={33} cy={30} r={11} fill="url(#tr)" />
      <Circle cx={16} cy={16} r={5} fill="#fff" opacity={night ? 0.05 : 0.18} />
    </Svg>
  );
}

function Skyline({ w, h, night }: { w: number; h: number; night: boolean }) {
  const parts = useMemo(() => {
    const out: { x: number; y: number; bw: number; bh: number; layer: number; wins: { x: number; y: number; lit: boolean }[]; spire?: boolean; dome?: boolean }[] = [];
    [0, 1].forEach((layer) => {
      const r = rng(7 + layer * 13);
      let x = layer ? -10 : -24;
      while (x < w + 20) {
        const bw = 28 + r() * 28;
        const bh = (layer ? 46 : 70) + r() * (layer ? 46 : 62);
        const wins: { x: number; y: number; lit: boolean }[] = [];
        for (let yy = 8; yy < bh - 6; yy += 10) for (let xx = 5; xx < bw - 6; xx += 9) wins.push({ x: xx, y: yy, lit: r() > 0.55 });
        out.push({ x, y: h - bh, bw, bh, layer, wins, spire: !layer && r() > 0.82, dome: !layer && r() > 0.9 });
        x += bw + (layer ? 3 : 5 + r() * 8);
      }
    });
    return out;
  }, [w, h]);
  const far = night ? "#1F2227" : "#C5D2EC";
  const near = night ? "#292C33" : "#A9B9DB";
  const lit = night ? "#FFD5C4" : "#FFFFFF";
  const dim = night ? "#34373F" : "#BCC9E6";
  const tx = w * 0.78;
  return (
    <Svg width={w} height={h}>
      {parts.map((b, i) => (
        <G key={i} x={b.x} y={b.y}>
          <Rect width={b.bw} height={b.bh} rx={2.4} fill={b.layer ? near : far} />
          {b.spire ? <Rect x={b.bw / 2 - 1} y={-12} width={2} height={12} fill={b.layer ? near : far} /> : null}
          {b.dome ? <Path d={`M${b.bw / 2 - 11} 0 a11 11 0 0 1 22 0z`} fill={b.layer ? near : far} transform="translate(0 -1)" /> : null}
          {b.wins.map((wn, j) => (
            <Rect key={j} x={wn.x} y={wn.y} width={4.4} height={5.4} rx={0.8} fill={wn.lit ? lit : dim} opacity={wn.lit ? (night ? 0.9 : 0.6) : night ? 0.7 : 0.5} />
          ))}
        </G>
      ))}
      <G x={tx} y={0}>
        <Path d={`M-3 ${h} L-1.4 ${h - 118} L1.4 ${h - 118} L3 ${h}z`} fill={night ? "#3A3E47" : "#8FA2CB"} />
        <Ellipse cx={0} cy={h - 118} rx={9} ry={5.4} fill={night ? "#4A4F5A" : "#7F93C0"} />
        <Rect x={-0.8} y={h - 150} width={1.6} height={32} fill={night ? "#4A4F5A" : "#7F93C0"} />
        <Circle cx={0} cy={h - 150} r={1.8} fill={night ? "#FFD5C4" : "#E5484D"} />
      </G>
    </Svg>
  );
}

export function TownScene({ w, h }: { w: number; h: number }) {
  const { t, isDark: night } = useTheme();
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((v) => 1 - v), 260);
    return () => clearInterval(id);
  }, []);
  const base = Math.max(h - 345, 150);
  const skyH = 112;
  const walkY = base + 26;
  const roadTop = base + 30;
  const roadH = 44;
  const road = roadTop + roadH;
  const stars = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: 22 }, () => ({ x: r() * w, y: 8 + r() * Math.max(40, base - 120), s: 0.7 + r() * 1.3, tw: r() > 0.5 }));
  }, [w, base]);
  if (w < 50 || h < 200) return null;
  const sprite = (key: string, node: ReactNode, top: number, from: number, to: number, duration: number, phase: number, bob = 0, flip = false) => (
    <Mover key={key} from={from} to={to} duration={duration} phase={phase} bob={bob} top={top} flip={flip}>{node}</Mover>
  );
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, overflow: "hidden" }}>
      <LinearGradient colors={night ? ["#0B0D10", "#17191C"] : ["#CFE4FF", t.bg]} locations={[0, 0.62]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />

      {night ? (
        <Svg width={w} height={base} style={{ position: "absolute", left: 0, top: 0 }}>
          {stars.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#F2E7C4" opacity={s.tw ? (f ? 0.9 : 0.35) : 0.65} />)}
          <Circle cx={w * 0.16} cy={52} r={17} fill="#F2E7C4" opacity={0.95} />
          <Circle cx={w * 0.16 + 7} cy={47} r={15} fill="#0B0D10" opacity={0.92} />
        </Svg>
      ) : (
        <Svg width={w} height={base} style={{ position: "absolute", left: 0, top: 0 }}>
          <Circle cx={w * 0.84} cy={58} r={26} fill="#FFE27A" opacity={0.35} />
          <Circle cx={w * 0.84} cy={58} r={16} fill="#FFD23F" />
        </Svg>
      )}
      {!night
        ? [
            { top: 30, size: 80, d: 90000, p: 0.2 },
            { top: 78, size: 60, d: 70000, p: 0.65 },
            { top: 54, size: 50, d: 110000, p: 0.95 },
          ].map((c, i) => (
            <Drift key={i} w={w} size={c.size} top={c.top} duration={c.d} phase={c.p}>
              <Svg width={c.size} height={c.size * 0.5} viewBox="0 0 80 40">
                <Ellipse cx={28} cy={26} rx={22} ry={11} fill="#fff" opacity={0.9} />
                <Ellipse cx={46} cy={20} rx={18} ry={13} fill="#fff" opacity={0.9} />
                <Ellipse cx={58} cy={28} rx={16} ry={9} fill="#fff" opacity={0.9} />
              </Svg>
            </Drift>
          ))
        : null}
      {sprite("b1", <Bird f={f} c={night ? "#A9A8C8" : "#4A90E2"} />, 66, -40, w + 40, 16000, 0.3, 4)}
      {sprite("b2", <Bird f={1 - f} c={night ? "#B5AAD0" : "#E4572E"} />, 104, w + 40, -40, 21000, 0.7, 5, true)}

      <View style={{ position: "absolute", left: 0, top: base - skyH }}>
        <Skyline w={w} h={skyH} night={night} />
      </View>

      <LinearGradient colors={night ? ["#1B211E", "#1D1F23"] : ["#D8EBDB", t.surface2]} style={{ position: "absolute", left: 0, right: 0, top: base, bottom: 0 }} />
      <View style={{ position: "absolute", left: 0, right: 0, top: base, height: 32, backgroundColor: night ? "#2A2C31" : "#E3E0D6" }} />
      <View style={{ position: "absolute", left: 0, right: 0, top: base + 30, height: 3, backgroundColor: night ? "#3A3D44" : "#CFCABD" }} />

      {[0.06, 0.34, 0.62, 0.9].map((p, i) => (
        <View key={i} style={{ position: "absolute", left: w * p - 22, top: base - 38 }}><Tree s={0.9 + (i % 2) * 0.15} night={night} /></View>
      ))}
      {[0.2, 0.5, 0.78].map((p, i) => (
        <View key={i} style={{ position: "absolute", left: w * p - 6, top: base - 30 }}>
          <Svg width={12} height={60} viewBox="0 0 12 60">
            {night ? <Circle cx={6} cy={5} r={11} fill="#FFD5C4" opacity={0.18} /> : null}
            <Rect x={5} y={6} width={2} height={50} fill={night ? "#4A4F5A" : "#7C879E"} />
            <Rect x={2} y={2} width={8} height={5} rx={2} fill={night ? "#FFD5C4" : "#AEB8CC"} />
          </Svg>
        </View>
      ))}

      <View style={{ position: "absolute", left: 0, right: 0, top: roadTop + 3, height: roadH, backgroundColor: night ? "#16181B" : "#6E7587" }} />
      <Svg width={w} height={4} style={{ position: "absolute", left: 0, top: roadTop + 3 + roadH / 2 - 1 }}>
        {Array.from({ length: Math.ceil(w / 34) }, (_, i) => <Rect key={i} x={i * 34 + 4} y={1} width={18} height={2} rx={1} fill={night ? "#5B9AE0" : "#F3F4FA"} opacity={0.65} />)}
      </Svg>
      <View style={{ position: "absolute", left: 0, right: 0, top: roadTop + 3 + roadH, height: 3, backgroundColor: night ? "#3A3D44" : "#CFCABD" }} />

      {sprite("p1", <Person v={0} f={f} />, walkY - 46, -40, w + 40, 30000, 0.1, 1.4)}
      {sprite("p2", <Person v={1} f={f} />, walkY - 46, w + 40, -40, 36000, 0.55, 1.4, true)}
      {sprite("p3", <Person v={2} f={1 - f} />, walkY - 46, -40, w + 40, 26000, 0.62, 1.4)}
      {sprite("p4", <Person v={4} f={f} />, walkY - 46, w + 40, -40, 33000, 0.05, 1.4, true)}
      {sprite("p5", <Person v={3} f={1 - f} />, walkY - 46, -40, w + 40, 40000, 0.88, 1.4)}
      {sprite("d1", <Dog f={f} />, walkY - 26, -50, w + 50, 24000, 0.28, 1.2)}
      {sprite("c1", <Cat f={1 - f} />, walkY - 24, w + 50, -50, 30000, 0.4, 1, true)}

      {sprite("v1", <Car body="#E4572E" f={f} />, road - 38 - 24, -90, w + 90, 9000, 0.35, 0.6)}
      {sprite("v2", <Truck f={f} />, road - 47 - 4, w + 120, -120, 13000, 0.1, 0.5, true)}
      {sprite("v3", <Car body="#F6C945" f={1 - f} taxi />, road - 38 - 24, w + 90, -90, 10000, 0.7, 0.6, true)}
      {sprite("v4", <Bus f={f} />, road - 45 - 4, -130, w + 130, 16000, 0.62, 0.5)}
      {sprite("v5", <Car body="#18A999" f={f} />, road - 38 - 24, -90, w + 90, 11000, 0.95, 0.6)}
    </View>
  );
}
