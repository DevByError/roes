import { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Flag, Info, Newspaper, Plus, ScrollText } from "lucide-react-native";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { PlaceReportCard } from "@/features/reports/PlaceReportCard";
import { NoticeCard, sourceKind } from "@/features/user/NoticeCard";
import { NoticeSheet } from "@/features/user/NoticeSheet";
import { useUserCtx } from "@/features/user/data";
import { RULE_META } from "@/lib/rulemeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Notice, Rule } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Card, EmptyState, Reveal, ScreenHeader, toneColors } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { useScrollReset } from "@/lib/useScrollReset";

type Tab = "notices" | "rules" | "reports";
type Src = "all" | "city" | "mine" | "places";

export default function Community() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const ctx = useUserCtx();
  const markSeen = useApp((s) => s.markSeen);
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>("notices");
  const [src, setSrc] = useState<Src>("all");
  const [open, setOpen] = useState<Notice | null>(null);
  const placeReports = useApp((s) => s.placeReports);
  const removeReport = useApp((s) => s.removePlaceReport);

  useEffect(() => {
    if (tabParam === "rules" || tabParam === "notices" || tabParam === "reports") {
      setTab(tabParam);
      router.setParams({ tab: undefined });
    }
  }, [tabParam]);

  const me = ctx.me;
  const myReports = useMemo(() => placeReports.filter((r) => r.placeId === me?.placeId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [placeReports, me?.placeId]);
  if (!me) return null;
  const counts = { all: ctx.notices.length, city: 0, mine: 0, places: 0 };
  ctx.notices.forEach((n) => { const k = sourceKind(n, me.placeId); counts[k === "place" ? "places" : k]++; });
  const list = ctx.notices.filter((n) => src === "all" || sourceKind(n, me.placeId) === (src === "places" ? "place" : src));
  const chips: { k: Src; label: string }[] = [
    { k: "all", label: "All" },
    { k: "mine", label: "My residence" },
    { k: "city", label: "City Hall" },
    { k: "places", label: "Public places" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {tab === "notices" ? (
        <FlatList key={rk}
          data={list}
          keyExtractor={(n) => n.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_SPACE + 24, gap: 12 }}
          ListHeaderComponent={
            <View style={{ marginHorizontal: -20 }}>
              <Header tab={tab} setTab={setTab} unseen={ctx.unseen} reports={myReports.length} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 16 }}>
                {chips.map((c) => {
                  const on = src === c.k;
                  return (
                    <Tap key={c.k} haptic="select" onPress={() => setSrc(c.k)} style={{ height: 38, paddingHorizontal: 14, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: on ? t.primary : t.surface, borderWidth: 1, borderColor: on ? t.primary : t.border }}>
                      <Text v="small" style={{ fontFamily: font.bold }} color={on ? "onPrimary" : "sub"}>{c.label}</Text>
                      <Text style={{ fontFamily: font.heavy, fontSize: 11.5 }} color={on ? "rgba(255,255,255,0.75)" : "mute"}>{counts[c.k]}</Text>
                    </Tap>
                  );
                })}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={<EmptyState icon={Newspaper} title="Nothing here" text="Notices from this source will show up here." />}
          renderItem={({ item, index }) => (
            <Reveal i={index}>
              <NoticeCard notice={item} kind={sourceKind(item, me.placeId)} source={ctx.sourceOf(item)} unread={!ctx.isSeen(item)} onPress={() => { markSeen(item.id); setOpen(item); }} />
            </Reveal>
          )}
        />
      ) : tab === "reports" ? (
        <FlatList key={rk}
          data={myReports}
          keyExtractor={(r) => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_SPACE + 24, gap: 12 }}
          ListHeaderComponent={
            <View style={{ marginHorizontal: -20 }}>
              <Header tab={tab} setTab={setTab} unseen={ctx.unseen} reports={myReports.length} />
              <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
                <Button label="Report something at my residence" variant="soft" size="md" icon={Plus} onPress={() => router.push({ pathname: "/user/report/new", params: { target: "place" } })} />
              </View>
            </View>
          }
          ListEmptyComponent={<EmptyState icon={Flag} title="No reports yet" text="Spotted a broken light or a blocked exit? Post it so everyone here, and your admin, can see." />}
          renderItem={({ item, index }) => (
            <Reveal i={index}>
              <PlaceReportCard report={item} onDelete={() => removeReport(item.id)} />
            </Reveal>
          )}
        />
      ) : (
        <RulesView header={<Header tab={tab} setTab={setTab} unseen={ctx.unseen} reports={myReports.length} />} />
      )}
      <NoticeSheet notice={open} kind={open ? sourceKind(open, me.placeId) : "city"} source={open ? ctx.sourceOf(open) : ""} onClose={() => setOpen(null)} />
    </View>
  );
}

function Header({ tab, setTab, unseen, reports }: { tab: Tab; setTab: (t: Tab) => void; unseen: number; reports: number }) {
  return (
    <View>
      <ScreenHeader eyebrow="Your community" title={tab === "notices" ? "Notices" : tab === "rules" ? "House rules" : "Reports"} subtitle={tab === "notices" ? (unseen ? `${unseen} you haven't opened` : "You're all caught up") : tab === "rules" ? "What everyone agreed to" : "What residents flagged here"} />
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: "notices", label: "Notices", count: unseen || undefined }, { value: "rules", label: "Rules" }, { value: "reports", label: "Reports", count: reports || undefined }]} />
      </View>
    </View>
  );
}

function RulesView({ header }: { header: React.ReactNode }) {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const { place } = useUserCtx();
  const [type, setType] = useState<"residents" | "visitors">("residents");
  const [sel, setSel] = useState<Rule | null>(null);
  if (!place) return null;
  const rules = place.rules[type];
  return (
    <ScrollView key={rk} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_SPACE + 24 }}>
      {header}
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Segmented value={type} onChange={setType} options={[{ value: "residents", label: "For residents", count: place.rules.residents.length }, { value: "visitors", label: "For visitors", count: place.rules.visitors.length }]} />
        <View style={{ flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: t.goldSoft, alignItems: "center" }}>
          <Info size={19} color={t.goldInk} />
          <Text v="small" color="goldInk" style={{ flex: 1, fontFamily: font.semibold, lineHeight: 18 }}>
            {type === "residents" ? `These apply to everyone living at ${place.name}.` : "Share these with guests before they visit. Residents are responsible for their visitors."}
          </Text>
        </View>
        {rules.length === 0 ? (
          <EmptyState icon={ScrollText} title="No rules yet" text="Your admin hasn't published rules here." />
        ) : (
          rules.map((r, i) => {
            const m = RULE_META[r.category];
            const c = toneColors(t, isDark, m.tone);
            return (
              <Reveal i={i} key={r.id}>
                <Tap onPress={() => setSel(r)} scale={0.985}>
                  <Card pad={14} style={{ flexDirection: "row", gap: 13 }}>
                    <View style={{ alignItems: "center", gap: 8 }}>
                      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                        <m.icon size={21} color={c.fg} strokeWidth={2.2} />
                      </View>
                      <Text style={{ fontFamily: font.heavy, fontSize: 12, fontVariant: ["tabular-nums"] }} color="mute">{String(i + 1).padStart(2, "0")}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text v="sub">{r.title}</Text>
                      <Text v="small" color="sub" style={{ marginTop: 4, lineHeight: 19 }}>{r.text}</Text>
                    </View>
                  </Card>
                </Tap>
              </Reveal>
            );
          })
        )}
      </View>
      <Sheet visible={!!sel} onClose={() => setSel(null)} title={sel?.title} subtitle={sel ? RULE_META[sel.category].label : undefined} footer={sel && type === "residents" ? <Button label="Someone is breaking this rule" variant="soft" icon={Flag} onPress={() => { const c = sel.category; setSel(null); router.push({ pathname: "/user/report/new", params: { category: c } }); }} /> : undefined}>
        {sel && <Text v="body" style={{ lineHeight: 26, paddingBottom: 8 }}>{sel.text}</Text>}
      </Sheet>
    </ScrollView>
  );
}
