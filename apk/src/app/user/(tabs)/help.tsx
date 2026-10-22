import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MessageSquareText, Plus, ShieldCheck, Users } from "lucide-react-native";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { useUserCtx } from "@/features/user/data";
import { STATUS } from "@/lib/complaintmeta";
import { timeAgo } from "@/lib/format";
import { KIND } from "@/lib/helpmeta";
import { font, radius, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Fab } from "@/ui/Fab";
import { Badge, EmptyState, Reveal, ScreenHeader } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { useScrollReset } from "@/lib/useScrollReset";

type Tab = "complaints" | "reports";

export default function Help() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const ctx = useUserCtx();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>("complaints");

  useEffect(() => {
    if (tabParam === "reports" || tabParam === "complaints") {
      setTab(tabParam);
      router.setParams({ tab: undefined });
    }
  }, [tabParam]);

  const me = ctx.me;
  if (!me) return null;

  const header = (
    <View style={{ marginHorizontal: -20 }}>
      <ScreenHeader eyebrow="Get help" title="Help" subtitle={tab === "complaints" ? "Send a request to your admin, a place or the mayor" : "Sort things out with a neighbor, with a mediator"} />
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: "complaints", label: "Complaints", count: ctx.myComplaints.length }, { value: "reports", label: "Neighbor reports", count: ctx.myReports.length }]} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {tab === "complaints" ? (
        <FlatList
          key={`c${rk}`}
          data={ctx.myComplaints}
          keyExtractor={(c) => c.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_SPACE + 90, gap: 12 }}
          ListHeaderComponent={header}
          ListEmptyComponent={<EmptyState icon={MessageSquareText} title="No complaints yet" text="Something broken or bothering you? Tell your admin, a specific place, or the mayor's office." action={<Button label="Write a complaint" size="md" icon={Plus} onPress={() => router.push("/user/complaint/new")} />} />}
          renderItem={({ item, index }) => {
            const k = KIND[item.kind];
            const s = STATUS[item.status];
            const last = item.messages[item.messages.length - 1];
            const place = ctx.places.find((p) => p.id === item.placeId);
            return (
              <Reveal i={index}>
                <Tap onPress={() => router.push({ pathname: "/user/complaint/[id]", params: { id: item.id } })} scale={0.985}>
                  <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: item.userUnread ? t.primary + "55" : t.border, shadowColor: t.shadow, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Badge label={item.kind === "place" && place ? place.name : k.label} tone={k.tone} icon={k.icon} />
                      <View style={{ flex: 1 }} />
                      {item.userUnread && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.primary }} />}
                      <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="mute">{timeAgo(last?.at ?? item.createdAt)}</Text>
                    </View>
                    <Text v="sub" numberOfLines={1} style={{ marginTop: 10, fontFamily: item.userUnread ? font.heavy : font.bold }}>{item.subject}</Text>
                    <Text v="small" color="sub" numberOfLines={2} style={{ marginTop: 4, lineHeight: 19 }}>{last?.from === "user" ? "You: " : ""}{last?.text}</Text>
                    <View style={{ marginTop: 11 }}><Badge label={s.label} tone={s.tone} dot /></View>
                  </View>
                </Tap>
              </Reveal>
            );
          }}
        />
      ) : (
        <FlatList
          key={`r${rk}`}
          data={ctx.myReports}
          keyExtractor={(r) => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_SPACE + 90, gap: 12 }}
          ListHeaderComponent={
            <View>
              {header}
              <View style={{ flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: t.primarySoft, alignItems: "center", marginBottom: 14 }}>
                <ShieldCheck size={20} color={t.primaryInk} />
                <Text v="small" style={{ flex: 1, fontFamily: font.semibold, lineHeight: 18 }} color="primaryInk">A friendly AI mediator joins every chat, keeps it respectful and can bring in your admin if needed.</Text>
              </View>
            </View>
          }
          ListEmptyComponent={<EmptyState icon={Users} title="No neighbor reports" text="If a neighbor is breaking a rule, start a group chat. The mediator keeps it calm." action={<Button label="Start a report" size="md" icon={Plus} onPress={() => router.push("/user/report/new")} />} />}
          renderItem={({ item, index }) => {
            const group = item.againstId === "all";
            const otherId = item.fromId === me.id ? item.againstId : item.fromId;
            const other = group ? undefined : ctx.accounts.find((a) => a.id === otherId);
            const starter = ctx.accounts.find((a) => a.id === item.fromId);
            const last = item.messages[item.messages.length - 1];
            const tone = item.status === "open" ? "primary" : item.status === "resolved" ? "success" : "warn";
            return (
              <Reveal i={index}>
                <Tap onPress={() => router.push({ pathname: "/user/report/[id]", params: { id: item.id } })} scale={0.985}>
                  <View style={{ flexDirection: "row", gap: 13, backgroundColor: t.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: item.unread && item.status === "open" ? t.primary + "55" : t.border }}>
                    <View>
                      {group ? (
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.primarySoft, alignItems: "center", justifyContent: "center" }}><Users size={22} color={t.primaryInk} /></View>
                      ) : <Avatar who={other} size={48} />}
                      {item.unread && item.status === "open" && <View style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: t.primary, borderWidth: 2.5, borderColor: t.surface }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Text v="small" style={{ fontFamily: font.bold, flex: 1 }} numberOfLines={1}>{group ? `All neighbors${item.fromId === me.id ? "" : ` · by ${starter?.name.split(" ")[0] ?? "a neighbor"}`}` : other?.name ?? "Neighbor"}</Text>
                        <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="mute">{timeAgo(last?.at ?? item.createdAt)}</Text>
                      </View>
                      <Text v="sub" numberOfLines={1} style={{ fontSize: 15 }}>{item.subject}</Text>
                      <Text v="small" color="sub" numberOfLines={1} style={{ marginTop: 3 }}>{last?.from === "mod" ? "Mediator: " : last?.from === me.id ? "You: " : ""}{last?.flagged ? "Message held back" : last?.text}</Text>
                      <View style={{ marginTop: 9 }}><Badge label={item.status === "open" ? "In progress" : item.status === "resolved" ? "Resolved" : "With your admin"} tone={tone} dot /></View>
                    </View>
                  </View>
                </Tap>
              </Reveal>
            );
          }}
        />
      )}
      <Fab label={tab === "complaints" ? "New complaint" : "New report"} icon={Plus} onPress={() => router.push(tab === "complaints" ? "/user/complaint/new" : "/user/report/new")} />
    </View>
  );
}
