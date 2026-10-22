import { useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withDecay, withTiming, type SharedValue } from "react-native-reanimated";
import { Building2, Crown, Landmark, LocateFixed, Minus, Plus } from "lucide-react-native";
import { MAP_ASPECT, MAP_IMAGE, toImageXY } from "@/lib/map-config";
import { font, useTheme } from "@/lib/theme";
import type { Place } from "@/lib/types";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

const MIN = 1;
const MAX = 4;

const clamp = (v: number, lo: number, hi: number) => {
  "worklet";
  return Math.min(Math.max(v, lo), hi);
};

export interface MapFocus {
  id: string;
  key: number;
}

export function CityMap({
  places,
  selectedId,
  ownId,
  focus,
  onSelect,
  controlsBottom,
}: {
  places: Place[];
  selectedId: string | null;
  ownId?: string;
  focus: MapFocus | null;
  onSelect: (id: string | null) => void;
  controlsBottom: number;
}) {
  const { t, isDark } = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const base = useMemo(() => {
    if (!size.w || !size.h) return { w: 0, h: 0 };
    const w = Math.max(size.w * 1.3, size.h * MAP_ASPECT);
    return { w, h: w / MAP_ASPECT };
  }, [size]);

  const s = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const cw = useSharedValue(0);
  const ch = useSharedValue(0);
  const bw = useSharedValue(0);
  const bh = useSharedValue(0);
  const ss = useSharedValue(1);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);

  const fixX = (v: number, sc: number) => {
    "worklet";
    return clamp(v, Math.min(0, cw.value - bw.value * sc), 0);
  };
  const fixY = (v: number, sc: number) => {
    "worklet";
    return clamp(v, Math.min(0, ch.value - bh.value * sc), 0);
  };

  const centerOn = (x: number, y: number, scale: number, animate: boolean) => {
    const sc = clamp(scale, MIN, MAX);
    const nx = fixX(cw.value / 2 - x * bw.value * sc, sc);
    const ny = fixY(ch.value * 0.4 - y * bh.value * sc, sc);
    if (animate) {
      s.value = withTiming(sc, { duration: 450 });
      tx.value = withTiming(nx, { duration: 450 });
      ty.value = withTiming(ny, { duration: 450 });
    } else {
      s.value = sc;
      tx.value = nx;
      ty.value = ny;
    }
  };

  const zoomBy = (factor: number) => {
    const ns = clamp(s.value * factor, MIN, MAX);
    const k = ns / s.value;
    const fx = cw.value / 2;
    const fy = ch.value / 2;
    const nx = fixX(fx - (fx - tx.value) * k, ns);
    const ny = fixY(fy - (fy - ty.value) * k, ns);
    s.value = withTiming(ns, { duration: 260 });
    tx.value = withTiming(nx, { duration: 260 });
    ty.value = withTiming(ny, { duration: 260 });
  };

  const own = places.find((p) => p.id === ownId);
  useEffect(() => {
    if (!base.w) return;
    cw.value = size.w;
    ch.value = size.h;
    bw.value = base.w;
    bh.value = base.h;
    const target = own ?? places[0];
    if (target) {
      const p = toImageXY(target.lat, target.lng);
      centerOn(p.x, p.y, 1.5, false);
    }
  }, [base.w, base.h]);

  useEffect(() => {
    if (!focus || !base.w) return;
    const p = places.find((x) => x.id === focus.id);
    if (!p) return;
    const xy = toImageXY(p.lat, p.lng);
    centerOn(xy.x, xy.y, Math.max(s.value, 2.2), true);
  }, [focus?.key]);

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      sx.value = tx.value;
      sy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = fixX(sx.value + e.translationX, s.value);
      ty.value = fixY(sy.value + e.translationY, s.value);
    })
    .onEnd((e) => {
      tx.value = withDecay({ velocity: e.velocityX, clamp: [Math.min(0, cw.value - bw.value * s.value), 0] });
      ty.value = withDecay({ velocity: e.velocityY, clamp: [Math.min(0, ch.value - bh.value * s.value), 0] });
    });

  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const pinch = Gesture.Pinch()
    .onStart(() => {
      ss.value = s.value;
      px.value = tx.value;
      py.value = ty.value;
    })
    .onUpdate((e) => {
      const ns = clamp(ss.value * e.scale, MIN, MAX);
      const k = ns / ss.value;
      tx.value = fixX(e.focalX - (e.focalX - px.value) * k, ns);
      ty.value = fixY(e.focalY - (e.focalY - py.value) * k, ns);
      s.value = ns;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      const ns = s.value < 2.4 ? Math.min(MAX, s.value * 2) : MIN;
      const k = ns / s.value;
      s.value = withTiming(ns, { duration: 280 });
      tx.value = withTiming(fixX(e.x - (e.x - tx.value) * k, ns), { duration: 280 });
      ty.value = withTiming(fixY(e.y - (e.y - ty.value) * k, ns), { duration: 280 });
    });

  const gesture = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pan, pinch));
  const mapStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: s.value }] }));

  const ctl = { width: 46, height: 46, borderRadius: 23, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: isDark ? t.surface2 : t.surface, shadowColor: t.shadow, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 };

  return (
    <View style={{ flex: 1, overflow: "hidden", backgroundColor: isDark ? t.surface2 : "#EEF3F2" }} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {base.w > 0 && (
        <GestureDetector gesture={gesture}>
          <View style={{ flex: 1 }}>
            <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: base.w, height: base.h, transformOrigin: "0% 0%" }, mapStyle]}>
              <Image source={MAP_IMAGE} style={{ width: "100%", height: "100%" }} resizeMode="stretch" />
              {isDark && <View pointerEvents="none" style={{ ...absoluteFill, backgroundColor: t.mapTint }} />}
              {places.map((p) => {
                const xy = toImageXY(p.lat, p.lng);
                return <Pin key={p.id} place={p} left={xy.x * base.w} top={xy.y * base.h} s={s} selected={p.id === selectedId} own={p.id === ownId} onPress={() => onSelect(p.id === selectedId ? null : p.id)} />;
              })}
            </Animated.View>
          </View>
        </GestureDetector>
      )}

      <View pointerEvents="box-none" style={{ position: "absolute", right: 16, bottom: controlsBottom, gap: 10 }}>
        {own && (
          <Tap accessibilityLabel="Go to my place" onPress={() => { const xy = toImageXY(own.lat, own.lng); centerOn(xy.x, xy.y, 2, true); }} style={ctl}>
            <LocateFixed size={21} color={t.primary} />
          </Tap>
        )}
        <View style={{ ...ctl, height: 92, justifyContent: "space-between", paddingVertical: 0 }}>
          <Tap accessibilityLabel="Zoom in" onPress={() => zoomBy(1.6)} style={{ width: 46, height: 46, alignItems: "center", justifyContent: "center" }}><Plus size={21} color={t.text} /></Tap>
          <View style={{ height: 1, width: 24, backgroundColor: t.border, alignSelf: "center", position: "absolute", top: 45 }} />
          <Tap accessibilityLabel="Zoom out" onPress={() => zoomBy(1 / 1.6)} style={{ width: 46, height: 46, alignItems: "center", justifyContent: "center" }}><Minus size={21} color={t.text} /></Tap>
        </View>
      </View>
    </View>
  );
}

const absoluteFill = { position: "absolute" as const, left: 0, right: 0, top: 0, bottom: 0 };

function Pin({ place, left, top, s, selected, own, onPress }: { place: Place; left: number; top: number; s: SharedValue<number>; selected: boolean; own: boolean; onPress: () => void }) {
  const { t, isDark } = useTheme();
  const residential = place.kind === "residential";
  const bg = own ? t.gold : residential ? t.mapRes : t.mapPublic;
  const Icon = own ? Crown : residential ? Building2 : Landmark;
  const inv = useAnimatedStyle(() => ({ transform: [{ scale: (selected ? 1.18 : 1) / s.value }] }));
  const label = useAnimatedStyle(() => ({ opacity: selected || own || s.value > 1.9 ? 1 : 0 }));
  return (
    <View style={{ position: "absolute", left, top, width: 0, height: 0, zIndex: selected ? 30 : own ? 20 : 10 }}>
      <Animated.View style={[{ position: "absolute", left: -70, width: 140, bottom: 0, alignItems: "center", transformOrigin: "50% 100%" }, inv]}>
        <Animated.View pointerEvents="none" style={[{ maxWidth: 140, marginBottom: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: isDark ? t.surface2 : "rgba(255,255,255,0.94)" }, label]}>
          <Text numberOfLines={1} style={{ fontFamily: font.bold, fontSize: 11 }}>{place.name}</Text>
        </Animated.View>
        <Tap onPress={onPress} haptic="select" scale={0.9} accessibilityLabel={place.name}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: bg, alignItems: "center", justifyContent: "center", borderWidth: selected ? 3.5 : 3, borderColor: selected ? t.gold : isDark ? t.surface : "#fff", shadowColor: t.shadow, shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 }}>
            <Icon size={19} color={own ? "#1B2433" : t.onMap} strokeWidth={2.4} />
          </View>
        </Tap>
        <View style={{ width: 11, height: 11, backgroundColor: selected ? t.gold : isDark ? t.surface : "#fff", transform: [{ rotate: "45deg" }], marginTop: -7, zIndex: -1 }} />
      </Animated.View>
    </View>
  );
}
