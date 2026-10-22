import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, LayoutChangeEvent, Platform, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, ZoomIn, cancelAnimation, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, Heart, Pencil, Play, RotateCcw, Timer, Trophy, User, type LucideIcon } from "lucide-react-native";
import { cleanNick, nickError, useBoard } from "@/features/game/board";
import { TownScene } from "@/features/game/scene";
import { BinBack, BinFront, BinSprite, ItemArt, binHeight, type ItemKind } from "@/features/game/art";
import { SubHeader } from "@/features/user/SubHeader";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";

type Bin = "recycle" | "rubbish";
interface Thing { label: string; kind: ItemKind; bin: Bin; tip: string }
const THINGS: Thing[] = [
  { label: "Glass bottle", kind: "bottle", bin: "recycle", tip: "Rinse glass and it can be recycled forever." },
  { label: "Old newspaper", kind: "newspaper", bin: "recycle", tip: "Clean paper becomes new paper." },
  { label: "Cardboard box", kind: "box", bin: "recycle", tip: "Flatten boxes to save space in the bin." },
  { label: "Milk carton", kind: "carton", bin: "recycle", tip: "Empty, rinse and squash cartons before recycling." },
  { label: "Drink can", kind: "can", bin: "recycle", tip: "Aluminium cans can be recycled again and again." },
  { label: "Banana peel", kind: "banana", bin: "rubbish", tip: "Food scraps spoil recycling. Keep them in the general bin." },
  { label: "Greasy pizza box", kind: "pizza", bin: "rubbish", tip: "Grease soaks into paper and ruins the whole batch." },
  { label: "Sweet wrapper", kind: "wrapper", bin: "rubbish", tip: "Mixed-material wrappers can't be recycled." },
  { label: "Cigarette butt", kind: "butt", bin: "rubbish", tip: "Butts are plastic filters. Bin them, never drop them." },
  { label: "Chicken bone", kind: "bone", bin: "rubbish", tip: "Food waste belongs in the general bin." },
];
const TIME = 45;
const LIVES = 3;
const ITEM = 128;
const CARD_H = ITEM + 34;
const BIN_W = 124;
const BIN_H = binHeight(BIN_W);
const BIN_BOTTOM = 16;
const pick = (not: number) => {
  let i = Math.floor(Math.random() * THINGS.length);
  if (i === not) i = (i + 1) % THINGS.length;
  return i;
};

type Phase = "intro" | "play" | "over";

export default function Game() {
  const { t, isDark } = useTheme();
  const best = useApp((s) => s.myBest);
  const setBest = useApp((s) => s.setBest);
  const setNick = useApp((s) => s.setNick);
  const { mine, myNick, taken, rows } = useBoard();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [nickErr, setNickErr] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(TIME);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [sorted, setSorted] = useState(0);
  const [right, setRight] = useState(0);
  const [tip, setTip] = useState<{ ok: boolean; text: string } | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [areaH, setAreaH] = useState(0);
  const [scene, setScene] = useState({ w: 0, h: 0 });
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const bump = useSharedValue(0);
  const sc = useSharedValue(1);
  const op = useSharedValue(1);
  const popL = useSharedValue(0);
  const popR = useSharedValue(0);
  const badL = useSharedValue(0);
  const badR = useSharedValue(0);
  const W = useSharedValue(360);
  const areaW = useRef(360);
  const [pop, setPop] = useState<{ k: number; text: string; left: boolean } | null>(null);
  const openL = useDerivedValue(() => Math.max(Math.min(1, Math.max(0, -x.value / (W.value / 4))), popL.value));
  const openR = useDerivedValue(() => Math.max(Math.min(1, Math.max(0, x.value / (W.value / 4))), popR.value));
  const locked = useRef(false);
  const endAt = useRef(0);
  const missRef = useRef<() => void>(() => {});
  const startFall = useCallback(() => {
    y.value = 0;
    x.value = 0;
    sc.value = 1;
    op.value = 1;
    cancelAnimation(y);
    const dur = Math.max(1600, 3800 - sorted * 110);
    y.value = withTiming(Math.max(areaH - CARD_H - 6, 120), { duration: dur, easing: Easing.linear }, (fin) => {
      if (fin) runOnJS(onMissJS)();
    });
  }, [areaH, sorted]);
  const onMissJS = () => missRef.current();

  const finish = useCallback(
    (finalScore: number) => {
      cancelAnimation(y);
      setPhase("over");
      setNewBest(finalScore > best && finalScore > 0);
      setBest(finalScore);
      buzz("success");
    },
    [best, setBest, y],
  );

  useEffect(() => {
    if (phase !== "play") return;
    const h = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setTime(left);
    }, 250);
    return () => clearInterval(h);
  }, [phase]);
  useEffect(() => {
    if (phase === "play" && time <= 0) finish(score);
  }, [time, phase, score, finish]);

  useEffect(() => {
    if (phase !== "play" || !areaH) return;
    locked.current = false;
    startFall();
  }, [phase, round, areaH, startFall]);

  const hasNick = !!myNick && !editing;
  const startOrSave = async () => {
    if (hasNick) return begin();
    const e = nickError(draft, taken) ?? (await setNick(cleanNick(draft)));
    if (e) {
      setNickErr(e);
      setShake((k) => k + 1);
      buzz("error");
      return;
    }
    setEditing(false);
    begin();
  };
  const changeNick = () => {
    setDraft(myNick);
    setNickErr(null);
    setEditing(true);
  };

  const begin = () => {
    setScore(0); setLives(LIVES); setStreak(0); setSorted(0); setRight(0); setTip(null); setNewBest(false);
    setTime(TIME);
    endAt.current = Date.now() + TIME * 1000;
    setIdx(pick(-1));
    setRound((r) => r + 1);
    setPhase("play");
  };

  const next = (delay = 260) => {
    setTimeout(() => {
      setIdx((i) => pick(i));
      setRound((r) => r + 1);
    }, delay);
  };

  const loseLife = (text: string) => {
    buzz("error");
    setStreak(0);
    setTip({ ok: false, text });
    bump.value = withSequence(withTiming(-10, { duration: 60 }), withTiming(10, { duration: 80 }), withTiming(0, { duration: 60 }));
    setLives((l) => {
      const n = l - 1;
      if (n <= 0) setTimeout(() => finish(score), 450);
      return n;
    });
  };

  const handleMiss = () => {
    if (phase !== "play" || locked.current) return;
    locked.current = true;
    op.value = withDelay(120, withTiming(0, { duration: 320 }));
    sc.value = withTiming(0.88, { duration: 320 });
    setSorted((n) => n + 1);
    loseLife(`Too slow! ${THINGS[idx].label}: ${THINGS[idx].tip}`);
    next(450);
  };
  useEffect(() => {
    missRef.current = handleMiss;
  });

  const sort = (bin: Bin) => {
    if (phase !== "play" || locked.current) return;
    locked.current = true;
    cancelAnimation(y);
    const th = THINGS[idx];
    setSorted((n) => n + 1);
    const left = bin === "recycle";
    const tx = (left ? -1 : 1) * (areaW.current / 4);
    const mouthY = areaH - BIN_BOTTOM - BIN_H * 0.7 - ITEM / 2;
    const popSv = left ? popL : popR;
    const badSv = left ? badL : badR;
    popSv.value = withSequence(withTiming(1, { duration: 120 }), withDelay(320, withTiming(0, { duration: 240 })));
    if (th.bin === bin) {
      const s = streak + 1;
      const mult = Math.min(3, 1 + Math.floor(s / 5));
      setScore((v) => v + 10 * mult);
      setStreak(s);
      setRight((n) => n + 1);
      setTip({ ok: true, text: s >= 5 ? `${s} in a row · ×${mult} points` : th.tip });
      buzz("light");
      x.value = withTiming(tx, { duration: 280, easing: Easing.out(Easing.quad) });
      y.value = withTiming(Math.max(mouthY, y.value), { duration: 280, easing: Easing.in(Easing.quad) });
      sc.value = withTiming(0.55, { duration: 280 });
      op.value = withDelay(200, withTiming(0, { duration: 100 }));
      setPop({ k: Date.now(), text: `+${10 * mult}`, left });
      setTimeout(() => setPop(null), 900);
      next(300);
    } else {
      x.value = withSequence(withTiming(tx * 0.75, { duration: 170 }), withTiming(tx * 1.5, { duration: 280 }));
      y.value = withSequence(withTiming(Math.max(mouthY - 50, y.value), { duration: 170 }), withTiming(Math.max(mouthY - 110, y.value - 40), { duration: 280 }));
      sc.value = withTiming(0.7, { duration: 450 });
      op.value = withDelay(150, withTiming(0, { duration: 300 }));
      badSv.value = 1;
      badSv.value = withTiming(0, { duration: 520 });
      loseLife(`${th.label} goes in ${th.bin === "recycle" ? "recycling" : "the rubbish bin"}. ${th.tip}`);
      next(560);
    }
  };

  const pan = Gesture.Pan()
    .minDistance(6)
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -50) runOnJS(sort)("recycle");
      else if (e.translationX > 50) runOnJS(sort)("rubbish");
      else x.value = withSpring(0);
    });

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { translateX: x.value + bump.value }, { rotate: `${(x.value / (W.value / 4)) * 12}deg` }, { scale: sc.value }], opacity: op.value }));
  const th = THINGS[idx];
  const mult = Math.min(3, 1 + Math.floor(streak / 5));
  const onLayout = (e: LayoutChangeEvent) => {
    areaW.current = e.nativeEvent.layout.width;
    W.value = e.nativeEvent.layout.width;
    setAreaH(Math.round(e.nativeEvent.layout.height));
  };
  const accuracy = sorted ? Math.round((right / sorted) * 100) : 0;

  const stat = (icon: LucideIcon, label: string, color?: string) => {
    const I = icon;
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
        <I size={15} color={color ?? t.sub} />
        <Text style={{ fontFamily: font.heavy, fontSize: 14 }}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader title="Tidy Town" subtitle={phase === "play" ? "Swipe or tap the right bin" : "Keep the city clean, one item at a time"}
        right={phase === "play" ? undefined : (
          <Tap onPress={() => router.push("/user/leaderboard")} accessibilityLabel="Leaderboard" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.goldSoft, alignItems: "center", justifyContent: "center" }}>
            <Trophy size={20} color={t.gold} />
          </Tap>
        )}
      />

      {phase === "intro" && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40, gap: 16 }}>
            <Animated.View entering={FadeIn} style={{ gap: 16, flexGrow: 1 }}>
              <LinearGradient colors={t.hero} style={{ borderRadius: radius.xl, padding: 20, alignItems: "center", gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4, height: 118 }}>
                  <View style={{ marginBottom: 4, transform: [{ rotate: "-12deg" }] }}><ItemArt kind="bottle" size={62} /></View>
                  <BinSprite kind="recycle" w={86} />
                  <BinSprite kind="rubbish" w={86} />
                  <View style={{ marginBottom: 4, transform: [{ rotate: "12deg" }] }}><ItemArt kind="banana" size={62} /></View>
                </View>
                <Text v="title" color="#fff" style={{ textAlign: "center" }}>Sort it right</Text>
                <Text v="body" color="#fff" style={{ textAlign: "center", opacity: 0.85, lineHeight: 22 }}>Items fall one by one. Swipe left or tap Recycle, swipe right or tap Rubbish. Three mistakes and it's over.</Text>
              </LinearGradient>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {[{ i: Timer, l: `${TIME} seconds` }, { i: Heart, l: `${LIVES} lives` }, { i: Trophy, l: `Best ${best}` }].map(({ i: I, l }) => (
                  <View key={l} style={{ flex: 1, alignItems: "center", gap: 6, paddingVertical: 12, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
                    <I size={18} color={t.gold} />
                    <Text style={{ fontFamily: font.bold, fontSize: 13 }}>{l}</Text>
                  </View>
                ))}
              </View>

              {hasNick ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
                  <Avatar name={myNick} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text v="label" color="mute">Playing as</Text>
                    <Text style={{ fontFamily: font.heavy, fontSize: 18 }} numberOfLines={1}>{myNick}</Text>
                  </View>
                  <Button label="Change" icon={Pencil} variant="soft" size="md" onPress={changeNick} />
                </View>
              ) : (
                <View style={{ gap: 6 }}>
                  <Field label="Your nickname" icon={User} value={draft} onChangeText={(v) => { setDraft(v); setNickErr(null); }} error={nickErr} shakeKey={shake} hint="Shown on the leaderboard instead of your real name." maxLength={14} autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={startOrSave} />
                </View>
              )}

              <View style={{ flex: 1 }} />
              <Button label={hasNick ? "Start playing" : editing ? "Save & play" : "Choose name & play"} icon={Play} variant="gold" onPress={startOrSave} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                {editing && myNick ? <Button label="Cancel" variant="ghost" size="md" style={{ flex: 1 }} onPress={() => { setEditing(false); setNickErr(null); }} /> : null}
                <Button label={`Leaderboard · ${rows.length} players`} icon={Crown} variant="outline" size="md" style={{ flex: 2 }} onPress={() => router.push("/user/leaderboard")} />
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {phase === "play" && (
        <View style={{ flex: 1 }} onLayout={(e) => setScene({ w: Math.round(e.nativeEvent.layout.width), h: Math.round(e.nativeEvent.layout.height) })}>
          <TownScene w={scene.w} h={scene.h} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingBottom: 8 }}>
            {stat(Timer, `${time}s`, time <= 10 ? t.danger : undefined)}
            {stat(Trophy, String(score), t.gold)}
            {mult > 1 ? <View style={{ height: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: t.gold, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: font.heavy, fontSize: 14 }} color="#1B2433">×{mult}</Text></View> : null}
            <View style={{ flex: 1 }} />
            <View style={{ flexDirection: "row", gap: 4 }}>
              {Array.from({ length: LIVES }).map((_, i) => <Heart key={i} size={22} color={i < lives ? t.danger : t.border} fill={i < lives ? t.danger : "transparent"} />)}
            </View>
          </View>

          <View style={{ height: 56, paddingHorizontal: 20, justifyContent: "center" }}>
            {tip && (
              <Animated.View key={tip.text + sorted} entering={FadeInDown.springify().damping(18)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: tip.ok ? t.successSoft : t.dangerSoft }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 12.5, lineHeight: 17 }} numberOfLines={2} color={tip.ok ? "successInk" : "danger"}>{tip.text}</Text>
              </Animated.View>
            )}
          </View>

          <GestureDetector gesture={pan}>
            <View style={{ flex: 1 }} onLayout={onLayout}>
              <LinearGradient colors={[t.bg, t.surface2]} pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BIN_BOTTOM + 52, borderTopWidth: 1, borderColor: t.border }} />

              <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: BIN_BOTTOM, flexDirection: "row" }}>
                <View style={{ flex: 1, alignItems: "center" }}><BinBack kind="recycle" w={BIN_W} open={openL} bad={badL} /></View>
                <View style={{ flex: 1, alignItems: "center" }}><BinBack kind="rubbish" w={BIN_W} open={openR} bad={badR} /></View>
              </View>

              <Animated.View style={[{ position: "absolute", top: 0, alignSelf: "center", left: "50%", marginLeft: -ITEM / 2 - 8, width: ITEM + 16, alignItems: "center" }, cardStyle]}>
                <ItemArt kind={th.kind} size={ITEM} />
                <View style={{ marginTop: -4, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: font.bold, fontSize: 12 }} numberOfLines={1}>{th.label}</Text>
                </View>
              </Animated.View>

              <View style={{ position: "absolute", left: 0, right: 0, bottom: BIN_BOTTOM, flexDirection: "row" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Tap onPress={() => sort("recycle")} haptic="none" scale={0.96} accessibilityLabel="Recycle bin" style={{ borderRadius: 24 }}>
                    <BinFront kind="recycle" w={BIN_W} bad={badL} label="RECYCLE" />
                  </Tap>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Tap onPress={() => sort("rubbish")} haptic="none" scale={0.96} accessibilityLabel="Rubbish bin" style={{ borderRadius: 24 }}>
                    <BinFront kind="rubbish" w={BIN_W} bad={badR} label="RUBBISH" />
                  </Tap>
                </View>
              </View>

              {pop ? (
                <Animated.View key={pop.k} pointerEvents="none" entering={ZoomIn.springify().damping(12)} exiting={FadeOut.duration(250)} style={{ position: "absolute", bottom: BIN_BOTTOM + BIN_H + 4, left: pop.left ? 0 : "50%", width: "50%", alignItems: "center" }}>
                  <Text style={{ fontFamily: font.heavy, fontSize: 24 }} color="gold">{pop.text}</Text>
                </Animated.View>
              ) : null}
            </View>
          </GestureDetector>
        </View>
      )}

      {phase === "over" && (
        <Animated.View entering={FadeIn} style={{ flex: 1, padding: 20, paddingBottom: 40, gap: 16 }}>
          <View style={{ alignItems: "center", padding: 26, borderRadius: radius.xl, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, gap: 6 }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: t.goldSoft, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
              <Trophy size={32} color={t.gold} />
            </View>
            <Text v="label" color="mute">{newBest ? "New best score" : "Final score"}</Text>
            <Text style={{ fontFamily: font.heavy, fontSize: 56, lineHeight: 64 }}>{score}</Text>
            <Text v="small" color="sub">Best: {Math.max(best, score)}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[{ l: "Sorted", v: String(sorted) }, { l: "Accuracy", v: `${accuracy}%` }, { l: "Streak bonus", v: `×${mult}` }].map((s) => (
              <View key={s.l} style={{ flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
                <Text style={{ fontFamily: font.heavy, fontSize: 20 }}>{s.v}</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="sub">{s.l}</Text>
              </View>
            ))}
          </View>
          {mine ? (
            <Tap onPress={() => router.push("/user/leaderboard")} accessibilityLabel="Open leaderboard">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: t.goldSoft }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.gold, alignItems: "center", justifyContent: "center" }}><Crown size={22} color="#1B2433" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.heavy, fontSize: 17 }} color="goldInk">You're #{mine.rank} on the leaderboard</Text>
                  <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="goldInk">{mine.nick} · best {mine.score} · tap to see everyone</Text>
                </View>
              </View>
            </Tap>
          ) : null}
          <Text v="small" color="sub" style={{ textAlign: "center", lineHeight: 19 }}>Clean recycling starts at home. Rinse containers and keep food out of the green bin.</Text>
          <View style={{ flex: 1 }} />
          <Button label="Play again" icon={RotateCcw} variant="gold" onPress={begin} />
          <Button label="Leaderboard" icon={Crown} variant="outline" onPress={() => router.push("/user/leaderboard")} />
        </Animated.View>
      )}
    </View>
  );
}
