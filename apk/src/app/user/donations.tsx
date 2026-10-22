import { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarClock, Heart, HeartHandshake, PartyPopper, Search, SearchX, Users } from "lucide-react-native";
import { SubHeader } from "@/features/user/SubHeader";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Donation, DonationCover } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Badge, EmptyState, Reveal } from "@/ui/Misc";
import { Field } from "@/ui/Field";
import { Sheet } from "@/ui/Sheet";
import { Chip } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { buzz } from "@/ui/haptics";

const COVER: Record<DonationCover, number> = {
  flood: require("../../../assets/donations/flood.jpg"),
  school: require("../../../assets/donations/school.jpg"),
  kitchen: require("../../../assets/donations/kitchen.jpg"),
  hospital: require("../../../assets/donations/hospital.jpg"),
};
const rm = (n: number) => `RM ${Math.round(n).toLocaleString("en-MY")}`;
const daysLeft = (iso: string) => Math.max(0, Math.ceil((+new Date(iso) - Date.now()) / 86400000));

function Progress({ pct, closed }: { pct: number; closed?: boolean }) {
  const { t } = useTheme();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(250, withTiming(Math.min(1, pct), { duration: 900 }));
  }, [pct, w]);
  const st = useAnimatedStyle(() => ({ width: `${w.value * 100}%` as `${number}%` }));
  return (
    <View style={{ height: 9, borderRadius: 5, backgroundColor: t.surface2, overflow: "hidden" }}>
      <Animated.View style={[{ height: 9, borderRadius: 5, backgroundColor: closed ? t.success : t.gold }, st]} />
    </View>
  );
}

export default function Donations() {
  const { t, isDark } = useTheme();
  const donations = useApp((s) => s.donations);
  const pledged = useApp((s) => s.pledged);
  const sessionId = useApp((s) => s.sessionId);
  const pledge = useApp((s) => s.pledge);
  const [sel, setSel] = useState<Donation | null>(null);
  const [amt, setAmt] = useState<number | null>(20);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "closed">("all");

  const mine = (id: string) => pledged[`${sessionId}:${id}`] ?? 0;
  const total = donations.reduce((n, d) => n + mine(d.id), 0);
  const key = q.trim().toLowerCase();
  const sorted = donations
    .filter((d) => status === "all" || d.status === status)
    .filter((d) => !key || `${d.title} ${d.category} ${d.description}`.toLowerCase().includes(key))
    .sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));
  const value = custom ? Number(custom.replace(/\D/g, "")) : amt ?? 0;

  const close = () => { setSel(null); setDone(null); setCustom(""); setAmt(20); };
  const give = () => {
    if (!sel || value < 1) { buzz("error"); return; }
    setBusy(true);
    void pledge(sel.id, value).then((ok) => {
      setBusy(false);
      if (!ok) return;
      setDone(value);
      buzz("success");
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader title="Donations" subtitle="Small gifts, shared by the whole city" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, gap: 18 }} showsVerticalScrollIndicator={false}>
        <Reveal i={0}>
          <LinearGradient colors={t.giving} style={{ borderRadius: radius.lg, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.gold, alignItems: "center", justifyContent: "center" }}>
              <HeartHandshake size={24} color="#1B2433" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color={t.givingInk}>My giving</Text>
              <Text style={{ fontFamily: font.heavy, fontSize: 24 }} color={t.givingBig}>{rm(total)}</Text>
            </View>
            <Text style={{ fontFamily: font.medium, fontSize: 12, width: 110, textAlign: "right", lineHeight: 16 }} color={t.givingInk}>{total ? "Thank you for helping." : "Your first gift starts here."}</Text>
          </LinearGradient>
        </Reveal>

        <View style={{ gap: 12 }}>
          <Field label="Search campaigns" icon={Search} value={q} onChangeText={setQ} returnKeyType="search" />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([["all", "All"], ["active", "Active"], ["closed", "Closed"]] as const).map(([v, l]) => <Chip key={v} label={l} on={status === v} onPress={() => setStatus(v)} />)}
          </View>
        </View>

        {sorted.length === 0 && <EmptyState icon={SearchX} title="No campaigns found" text="Try another word, or clear the filter." />}

        {sorted.map((d, i) => {
          const closed = d.status === "closed";
          const pct = d.raised / d.goal;
          const m = mine(d.id);
          return (
            <Reveal key={d.id} i={i + 1}>
              <View style={{ backgroundColor: t.surface, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: t.border, opacity: closed ? 0.8 : 1 }}>
                <View>
                  <Image source={d.image ? { uri: d.image } : COVER[d.cover]} style={{ width: "100%", height: 150 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  <LinearGradient colors={["transparent", "rgba(27,36,51,0.55)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 80 }} />
                  <View style={{ position: "absolute", left: 14, top: 14, flexDirection: "row", gap: 8 }}>
                    <Badge label={d.category} tone="gold" />
                    {closed && <Badge label="Goal reached" tone="success" icon={PartyPopper} />}
                  </View>
                </View>
                <View style={{ padding: 16, gap: 12 }}>
                  <Text v="heading" style={{ fontSize: 18 }}>{d.title}</Text>
                  <Text v="small" color="sub" style={{ lineHeight: 20 }}>{d.description}</Text>
                  <View style={{ gap: 7 }}>
                    <Progress pct={pct} closed={closed} />
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontFamily: font.heavy, fontSize: 14 }}>{rm(d.raised)} <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub">of {rm(d.goal)}</Text></Text>
                      <Text style={{ fontFamily: font.bold, fontSize: 13 }} color={closed ? "successInk" : "sub"}>{Math.round(pct * 100)}%</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Users size={14} color={t.mute} /><Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="sub">{d.donors} donors</Text></View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><CalendarClock size={14} color={t.mute} /><Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="sub">{closed ? "Closed" : `${daysLeft(d.deadline)} days left`}</Text></View>
                  </View>
                  {m > 0 && <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color="successInk">You gave {rm(m)}. Thank you!</Text>}
                  {!closed && <Button label={m ? "Give again" : "Donate"} variant="gold" icon={Heart} onPress={() => setSel(d)} />}
                </View>
              </View>
            </Reveal>
          );
        })}
        <Text style={{ fontFamily: font.medium, fontSize: 12, textAlign: "center", lineHeight: 17 }} color="mute">Pledges are recorded with the city office. No payment is taken in the app.</Text>
      </ScrollView>

      <Sheet visible={!!sel} onClose={close} title={done ? undefined : "Choose an amount"} subtitle={done ? undefined : sel?.title} footer={done ? <Button label="Done" variant="soft" onPress={close} /> : <Button label={value ? `Pledge ${rm(value)}` : "Pledge"} variant="gold" icon={Heart} onPress={give} loading={busy} disabled={value < 1} />}>
        {done ? (
          <View style={{ alignItems: "center", paddingVertical: 20, gap: 10 }}>
            <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: t.successSoft, alignItems: "center", justifyContent: "center" }}>
              <Heart size={34} color={t.success} fill={t.success} />
            </View>
            <Text v="title" style={{ textAlign: "center" }}>Thank you!</Text>
            <Text v="body" color="sub" style={{ textAlign: "center", lineHeight: 22 }}>Your pledge of {rm(done)} to “{sel?.title}” is recorded. Thank you for supporting your city.</Text>
          </View>
        ) : (
          <View style={{ gap: 16, paddingBottom: 10 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[5, 10, 20, 50, 100].map((a) => <Chip key={a} label={`RM ${a}`} on={!custom && amt === a} onPress={() => { setAmt(a); setCustom(""); }} />)}
            </View>
            <Field label="Or another amount (RM)" value={custom} onChangeText={(v) => setCustom(v.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" />
            <Text style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 18 }} color="mute">Nothing is charged in the app. Your pledge is recorded and counts towards the goal.</Text>
          </View>
        )}
      </Sheet>
    </View>
  );
}
