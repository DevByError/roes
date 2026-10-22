import { useMemo, useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { AlertTriangle, ChevronDown, Droplets, Flame, HeartPulse, Info, Phone, ShieldAlert, Car, Siren, type LucideIcon } from "lucide-react-native";
import { SubHeader } from "@/features/user/SubHeader";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { SafetyPolicy } from "@/lib/types";
import { Badge, Chip, Reveal, type Tone } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

const ICON: Record<SafetyPolicy["category"], LucideIcon> = { Fire: Flame, Flood: Droplets, Health: HeartPulse, Traffic: Car, Crime: ShieldAlert, General: Info };
const SEV: Record<SafetyPolicy["severity"], { label: string; tone: Tone }> = {
  critical: { label: "Critical", tone: "danger" },
  important: { label: "Important", tone: "warn" },
  info: { label: "Good to know", tone: "info" },
};

export default function Safety() {
  const { t, isDark } = useTheme();
  const policies = useApp((s) => s.policies);
  const [cat, setCat] = useState<"All" | SafetyPolicy["category"]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const cats = useMemo(() => ["All", ...Array.from(new Set(policies.map((p) => p.category)))] as ("All" | SafetyPolicy["category"])[], [policies]);
  const list = policies.filter((p) => cat === "All" || p.category === cat);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader title="Safety & policies" subtitle="Know what to do before you need to" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Reveal i={0}>
          <Tap onPress={() => Linking.openURL("tel:999")} accessibilityLabel="Call 999" scale={0.98} haptic="medium">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: t.emergency }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
                <Siren size={26} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.heavy, fontSize: 18 }} color="#fff">Emergency? Call 999</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 12.5, marginTop: 2, opacity: 0.85 }} color="#fff">Police · Ambulance · Fire. Tap to call.</Text>
              </View>
              <Phone size={22} color="#fff" />
            </View>
          </Tap>
        </Reveal>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {cats.map((c) => <Chip key={c} label={c} on={cat === c} onPress={() => setCat(c)} />)}
        </ScrollView>

        <View style={{ gap: 12 }}>
          {list.map((p, i) => {
            const Icon = ICON[p.category];
            const on = open === p.id;
            const sev = SEV[p.severity];
            return (
              <Animated.View key={p.id} layout={LinearTransition.springify().damping(20)} entering={FadeIn.delay(i * 50)}>
                <Tap onPress={() => setOpen(on ? null : p.id)} scale={0.99} haptic="select" accessibilityLabel={p.title}>
                  <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: on ? t.primary + "66" : t.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
                      <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: p.severity === "critical" ? t.dangerSoft : p.severity === "important" ? t.warnSoft : t.primarySoft, alignItems: "center", justifyContent: "center" }}>
                        <Icon size={22} color={p.severity === "critical" ? t.danger : p.severity === "important" ? t.warn : t.primaryInk} />
                      </View>
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text v="sub" style={{ fontSize: 15.5 }}>{p.title}</Text>
                        <View style={{ flexDirection: "row" }}><Badge label={sev.label} tone={sev.tone} icon={p.severity === "critical" ? AlertTriangle : undefined} /></View>
                      </View>
                      <View style={{ transform: [{ rotate: on ? "180deg" : "0deg" }] }}><ChevronDown size={20} color={t.mute} /></View>
                    </View>
                    <Text v="small" color="sub" style={{ marginTop: 11, lineHeight: 19 }}>{p.summary}</Text>
                    {on && (
                      <Animated.View entering={FadeIn.duration(220)} style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.border }}>
                        <Text style={{ fontFamily: font.medium, fontSize: 14.5, lineHeight: 23 }}>{p.body}</Text>
                      </Animated.View>
                    )}
                  </View>
                </Tap>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
