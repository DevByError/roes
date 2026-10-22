import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Building2, Check, Landmark, Lock, Search, Send, type LucideIcon } from "lucide-react-native";
import { useUserCtx } from "@/features/user/data";
import { COMPLAINT_CATEGORIES } from "@/lib/helpmeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Complaint } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Chip } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { buzz } from "@/ui/haptics";

const TARGETS: { kind: Complaint["kind"]; title: string; text: string; icon: LucideIcon }[] = [
  { kind: "private", title: "My residence admin", text: "Private. Only your admin sees it.", icon: Lock },
  { kind: "place", title: "A specific place", text: "Mall, station, park… goes to that place's admin.", icon: Building2 },
  { kind: "public", title: "The mayor", text: "Citywide issues, sent to City Hall.", icon: Landmark },
];

export default function NewComplaint() {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const ctx = useUserCtx();
  const add = useApp((s) => s.addComplaint);
  const [kind, setKind] = useState<Complaint["kind"]>("private");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Facilities");
  const [priority, setPriority] = useState<Complaint["priority"]>("medium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const [tried, setTried] = useState(false);

  const candidates = useMemo(() => {
    const k = q.trim().toLowerCase();
    return ctx.places
      .filter((p) => p.id !== ctx.me?.placeId)
      .filter((p) => !k || p.name.toLowerCase().includes(k) || p.address.toLowerCase().includes(k))
      .sort((a, b) => Number(a.kind === "residential") - Number(b.kind === "residential"))
      .slice(0, 8);
  }, [ctx.places, ctx.me?.placeId, q]);

  const subjectErr = tried && subject.trim().length < 4 ? "Give it a short title" : null;
  const bodyErr = tried && body.trim().length < 10 ? "Tell us a little more (10+ characters)" : null;
  const placeErr = tried && kind === "place" && !placeId ? "Choose which place" : null;

  const submit = () => {
    setTried(true);
    if (subject.trim().length < 4 || body.trim().length < 10 || (kind === "place" && !placeId)) {
      setShake((n) => n + 1);
      buzz("error");
      return;
    }
    setBusy(true);
    const target = kind === "private" ? ctx.me?.placeId ?? "" : kind === "place" ? placeId! : ctx.me?.placeId ?? "";
    void add({ kind, placeId: target, subject, category, priority, body }).then((id) => {
      setBusy(false);
      if (!id) return;
      buzz("success");
      toast("Complaint sent", "success");
      router.replace({ pathname: "/user/complaint/[id]", params: { id } });
    });
  };

  const dest = kind === "private" ? ctx.place?.name : kind === "place" ? ctx.places.find((p) => p.id === placeId)?.name : "City Hall";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={t.text} />
        </Tap>
        <View style={{ flex: 1 }}>
          <Text v="heading">New complaint</Text>
          <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{dest ? `To ${dest}` : "Choose a place below"}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ gap: 10 }}>
          <Text v="label" color="mute">Who should see it?</Text>
          {TARGETS.map((o) => {
            const on = kind === o.kind;
            return (
              <Tap key={o.kind} haptic="select" scale={0.985} onPress={() => setKind(o.kind)} accessibilityLabel={o.title}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: on ? t.primarySoft : t.surface, borderWidth: 1.5, borderColor: on ? t.primary : t.border }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: on ? t.primary : t.surface2, alignItems: "center", justifyContent: "center" }}>
                    <o.icon size={21} color={on ? t.onPrimary : t.sub} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text v="sub">{o.title}</Text>
                    <Text style={{ fontFamily: font.medium, fontSize: 12.5, marginTop: 2 }} color="sub">{o.text}</Text>
                  </View>
                  {on && <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" }}><Check size={14} color={t.onPrimary} strokeWidth={3} /></View>}
                </View>
              </Tap>
            );
          })}
        </View>

        {kind === "place" && (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: 10 }}>
            <Field label="Search places" icon={Search} value={q} onChangeText={setQ} />
            {placeErr ? <Text style={{ fontFamily: font.semibold, fontSize: 12.5, marginLeft: 4 }} color="danger">{placeErr}</Text> : null}
            <View style={{ gap: 8 }}>
              {candidates.map((p) => {
                const on = placeId === p.id;
                return (
                  <Tap key={p.id} haptic="select" onPress={() => setPlaceId(p.id)} scale={0.985}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1.5, borderColor: on ? t.primary : t.border }}>
                      <Building2 size={18} color={on ? t.primary : t.mute} />
                      <View style={{ flex: 1 }}>
                        <Text v="small" style={{ fontFamily: font.bold }} numberOfLines={1}>{p.name}</Text>
                        <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="sub" numberOfLines={1}>{p.kind === "residential" ? "Residential" : "Public"} · {p.address}</Text>
                      </View>
                      {on && <Check size={18} color={t.primary} strokeWidth={3} />}
                    </View>
                  </Tap>
                );
              })}
            </View>
          </Animated.View>
        )}

        <View style={{ gap: 10 }}>
          <Text v="label" color="mute">Topic</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {COMPLAINT_CATEGORIES.map((c) => <Chip key={c} label={c} on={category === c} onPress={() => setCategory(c)} />)}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text v="label" color="mute">How urgent is it?</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["low", "medium", "high"] as const).map((p) => {
              const on = priority === p;
              const col = p === "high" ? t.danger : p === "medium" ? t.warn : t.mute;
              return (
                <Tap key={p} haptic="select" onPress={() => setPriority(p)} style={{ flex: 1, height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: on ? col + "22" : t.surface, borderWidth: 1.5, borderColor: on ? col : t.border }}>
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: col }} />
                  <Text style={{ fontFamily: font.bold, fontSize: 14, textTransform: "capitalize" }} color={on ? "text" : "sub"}>{p}</Text>
                </Tap>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <Field label="Title" value={subject} onChangeText={setSubject} error={subjectErr} shakeKey={shake} maxLength={80} />
          <Field label="What happened?" value={body} onChangeText={setBody} error={bodyErr} shakeKey={shake} multiline hint="Where, since when, and anything that helps us fix it." />
        </View>

        <Button label="Send complaint" icon={Send} onPress={submit} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
