import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Building2, Flag, Search, ShieldCheck, Users } from "lucide-react-native";
import { useUserCtx } from "@/features/user/data";
import { RULE_CATEGORIES, RULE_META } from "@/lib/rulemeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { RuleCategory } from "@/lib/types";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Chip, EmptyState } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { buzz } from "@/ui/haptics";
import { firstName } from "@/lib/format";

const ROW = 62;
const GAP = 8;
const VISIBLE_ROWS = 5;
const LIST_MAX = VISIBLE_ROWS * ROW + (VISIBLE_ROWS - 1) * GAP + ROW / 2;

export default function NewReport() {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const ctx = useUserCtx();
  const add = useApp((s) => s.addReport);
  const addPlace = useApp((s) => s.addPlaceReport);
  const params = useLocalSearchParams<{ category?: string; target?: string }>();
  const [target, setTarget] = useState<"neighbor" | "place">(params.target === "place" ? "place" : "neighbor");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [pq, setPq] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "public" | "residential">("all");
  const initial = (RULE_CATEGORIES as string[]).includes(params.category ?? "") ? (params.category as RuleCategory) : "noise";
  const [category, setCategory] = useState<RuleCategory>(initial);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const [shake, setShake] = useState(0);

  const pk = pq.trim().toLowerCase();
  const myPlaceId = ctx.me?.placeId;
  const placeList = useMemo(() => {
    const rank = (p: (typeof ctx.places)[number]) => (p.id === myPlaceId ? 0 : p.kind === "non-residential" ? 1 : 2);
    return ctx.places
      .filter((p) => kindFilter === "all" || (kindFilter === "public" ? p.kind === "non-residential" : p.kind === "residential"))
      .filter((p) => !pk || p.name.toLowerCase().includes(pk) || p.address.toLowerCase().includes(pk) || p.district.toLowerCase().includes(pk))
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }, [ctx.places, pk, kindFilter, myPlaceId]);
  const pickedPlace = ctx.places.find((p) => p.id === placeId) ?? null;

  const rule = ctx.place?.rules.residents.find((r) => r.category === category);
  const subjectErr = tried && subject.trim().length < 4 ? "Give it a short title" : null;
  const detailsErr = tried && details.trim().length < 10 ? "Tell the mediator what happened (10+ characters)" : null;

  const submit = () => {
    if (target === "place") {
      setTried(true);
      if (!placeId || subject.trim().length < 4 || details.trim().length < 10) {
        setShake((n) => n + 1);
        buzz("error");
        if (!placeId) toast("Choose the place first", "info");
        return;
      }
      setBusy(true);
      void addPlace({ placeId, category, subject, details }).then((id) => {
        setBusy(false);
        if (!id) return;
        buzz("success");
        toast(`Posted to ${pickedPlace?.name ?? "the place"}`, "success");
        if (placeId === ctx.me?.placeId) router.replace({ pathname: "/user/community", params: { tab: "reports" } });
        else router.back();
      });
      return;
    }
    setTried(true);
    if (subject.trim().length < 4 || details.trim().length < 10) {
      setShake((n) => n + 1);
      buzz("error");
      return;
    }
    setBusy(true);
    void add({ category, subject, details }).then((id) => {
      setBusy(false);
      if (!id) return;
      buzz("success");
      router.replace({ pathname: "/user/report/[id]", params: { id } });
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={t.text} />
        </Tap>
        <View style={{ flex: 1 }}>
          <Text v="heading">{target === "neighbor" ? "Report a neighbor" : "Report a place"}</Text>
          <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{ctx.place?.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Segmented value={target} onChange={setTarget} options={[{ value: "neighbor", label: "A neighbor" }, { value: "place", label: "A place" }]} />

        <View style={{ flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: t.primarySoft }}>
          {target === "neighbor" ? <ShieldCheck size={20} color={t.primaryInk} style={{ marginTop: 1 }} /> : <Flag size={20} color={t.primaryInk} style={{ marginTop: 1 }} />}
          <Text v="small" style={{ flex: 1, fontFamily: font.semibold, lineHeight: 19 }} color="primaryInk">
            {target === "neighbor"
              ? "This opens a group chat with all your neighbors and the ROES Mediator, an AI that keeps things respectful. If it doesn't work out, you can send it to your admin."
              : "Your report is posted for everyone at that place and its admin to read. Keep it about the place, not a person."}
          </Text>
        </View>

        {target === "neighbor" ? (
        <View style={{ gap: 10 }}>
          <Text v="label" color="mute">Who will see it?</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.border }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.primarySoft, alignItems: "center", justifyContent: "center" }}>
              <Users size={22} color={t.primaryInk} />
            </View>
            <View style={{ flex: 1 }}>
              <Text v="sub">All neighbors</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 12.5, marginTop: 2, lineHeight: 18 }} color="sub">{ctx.neighbors.length} residents of {ctx.place?.name ?? "your residence"} can read and reply.</Text>
            </View>
          </View>
        </View>
        ) : (
        <View style={{ gap: 10 }}>
          <Text v="label" color="mute">Which place?</Text>
          {pickedPlace ? (
            <Animated.View entering={FadeInDown.springify().damping(18)} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: ROW, paddingVertical: 8, paddingLeft: 11, paddingRight: 8, borderRadius: radius.md, backgroundColor: t.primarySoft, borderWidth: 1.5, borderColor: t.primary }}>
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" }}><Building2 size={19} color={t.onPrimary} /></View>
              <View style={{ flex: 1 }}>
                <Text v="small" style={{ fontFamily: font.bold }} numberOfLines={1}>{pickedPlace.name}</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="sub" numberOfLines={1}>{pickedPlace.kind === "residential" ? "Residential" : "Public place"} · {pickedPlace.district}</Text>
              </View>
              <Tap onPress={() => { setPlaceId(null); setPq(""); }} haptic="select" accessibilityLabel="Change place" style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: font.bold, fontSize: 13 }} color="primary">Change</Text>
              </Tap>
            </Animated.View>
          ) : (
            <>
              <Field label="Search places by name or area" icon={Search} value={pq} onChangeText={setPq} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                {([["all", "All"], ["public", "Public places"], ["residential", "Residences"]] as const).map(([v, l]) => <Chip key={v} label={l} on={kindFilter === v} onPress={() => setKindFilter(v)} />)}
              </View>
              {placeList.length === 0 ? (
                <EmptyState icon={Building2} title="No place found" text="Try another name or area." />
              ) : (
                <>
                  <View style={{ borderRadius: radius.md, overflow: "hidden" }}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: LIST_MAX }} contentContainerStyle={{ gap: GAP }}>
                      {placeList.map((p) => (
                        <Tap key={p.id} haptic="select" scale={0.985} onPress={() => setPlaceId(p.id)} accessibilityLabel={p.name}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, height: ROW, paddingHorizontal: 11, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.border }}>
                            <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: p.id === myPlaceId ? t.primarySoft : t.surface2, alignItems: "center", justifyContent: "center" }}><Building2 size={19} color={p.id === myPlaceId ? (t.primaryInk) : t.sub} /></View>
                            <View style={{ flex: 1 }}>
                              <Text v="small" style={{ fontFamily: font.bold }} numberOfLines={1}>{p.name}</Text>
                              <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="sub" numberOfLines={1}>{p.id === myPlaceId ? "My residence" : `${p.kind === "residential" ? "Residence" : "Public place"} · ${p.district}`}</Text>
                            </View>
                          </View>
                        </Tap>
                      ))}
                    </ScrollView>
                  </View>
                  <Text style={{ fontFamily: font.medium, fontSize: 12, marginLeft: 4 }} color="mute">{placeList.length} place{placeList.length === 1 ? "" : "s"}. Scroll the list or search.</Text>
                </>
              )}
            </>
          )}
        </View>
        )}

        <View style={{ gap: 10 }}>
          <Text v="label" color="mute">{target === "neighbor" ? "Which rule?" : "What kind of issue?"}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {RULE_CATEGORIES.map((c) => <Chip key={c} label={RULE_META[c].label} icon={RULE_META[c].icon} on={category === c} onPress={() => setCategory(c)} />)}
          </View>
          {target === "neighbor" && rule && (
            <Animated.View key={rule.id} entering={FadeInDown.springify().damping(18)} style={{ padding: 13, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
              <Text style={{ fontFamily: font.bold, fontSize: 13.5 }}>{rule.title}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 19, marginTop: 3 }} color="sub">{rule.text}</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ gap: 14 }}>
          <Field label="Title" value={subject} onChangeText={setSubject} error={subjectErr} shakeKey={shake} maxLength={80} />
          <Field label="What happened?" value={details} onChangeText={setDetails} error={detailsErr} shakeKey={shake} multiline hint={target === "neighbor" ? "Stick to what you saw or heard. Calm and specific works best." : "Say what is wrong, where exactly, and since when."} />
        </View>

        <Button label={target === "neighbor" ? "Open the chat" : "Post report"} icon={target === "neighbor" ? Users : Flag} onPress={submit} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
