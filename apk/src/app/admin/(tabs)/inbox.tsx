import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, Flag, Inbox as InboxIcon } from "lucide-react-native";
import { useAdminCtx } from "@/features/admin/data";
import { PlaceReportsSheet } from "@/features/reports/PlaceReportsSheet";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { timeAgo } from "@/lib/format";
import { PRIORITY, STATUS, priorityColor } from "@/lib/complaintmeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { ComplaintStatus } from "@/lib/types";
import { Avatar } from "@/ui/Avatar";
import { Badge, EmptyState, Reveal, ScreenHeader } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { useScrollReset } from "@/lib/useScrollReset";

type Filter = "all" | ComplaintStatus;

export default function Inbox() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const { complaints, residential, unread, place } = useAdminCtx();
  const accounts = useApp((s) => s.accounts);
  const [filter, setFilter] = useState<Filter>("all");
  const [repOpen, setRepOpen] = useState(false);
  const placeReports = useApp((s) => s.placeReports);

  const counts = useMemo(
    () => ({ all: complaints.length, new: complaints.filter((c) => c.status === "new").length, in_review: complaints.filter((c) => c.status === "in_review").length, resolved: complaints.filter((c) => c.status === "resolved").length }),
    [complaints],
  );
  const repCount = placeReports.filter((r) => r.placeId === place?.id).length;
  const list = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);
  const chips: { k: Filter; label: string }[] = [
    { k: "all", label: "All" },
    { k: "new", label: "New" },
    { k: "in_review", label: "In review" },
    { k: "resolved", label: "Resolved" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList key={rk}
        data={list}
        keyExtractor={(c) => c.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_SPACE + 20, gap: 10 }}
        ListHeaderComponent={
          <View style={{ marginHorizontal: -20 }}>
            <ScreenHeader eyebrow={residential ? "Private complaints" : "Place complaints"} title="Inbox" subtitle={unread ? `${unread} unread` : "Everything is read"} />
            <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
              <Tap onPress={() => setRepOpen(true)} scale={0.985} haptic="select" accessibilityLabel="Resident reports">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: radius.md, backgroundColor: t.goldSoft }}>
                  <Flag size={19} color={t.goldInk} />
                  <Text v="small" color="goldInk" style={{ flex: 1, fontFamily: font.bold }}>{repCount ? `${repCount} resident report${repCount > 1 ? "s" : ""} about your place` : "No resident reports about your place"}</Text>
                  <ChevronRight size={18} color={t.goldInk} />
                </View>
              </Tap>
            </View>
            <FlatList
              horizontal
              data={chips}
              keyExtractor={(c) => c.k}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 16 }}
              renderItem={({ item }) => {
                const on = filter === item.k;
                return (
                  <Tap haptic="select" onPress={() => setFilter(item.k)} style={{ height: 40, paddingHorizontal: 14, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: on ? t.primary : t.surface, borderWidth: 1, borderColor: on ? t.primary : t.border }}>
                    <Text v="small" style={{ fontFamily: font.bold }} color={on ? "onPrimary" : "sub"}>{item.label}</Text>
                    <View style={{ minWidth: 22, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? "rgba(255,255,255,0.22)" : t.surface2 }}>
                      <Text style={{ fontFamily: font.heavy, fontSize: 11.5, fontVariant: ["tabular-nums"] }} color={on ? "onPrimary" : "sub"}>{counts[item.k]}</Text>
                    </View>
                  </Tap>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState icon={InboxIcon} title={filter === "all" ? "Nothing here yet" : "No complaints in this view"} text={filter === "all" ? "When someone files a complaint, it lands here." : "Try another filter to see the rest."} />}
        renderItem={({ item, index }) => {
          const who = accounts.find((a) => a.id === item.fromId);
          const last = item.messages[item.messages.length - 1];
          const s = STATUS[item.status];
          const p = PRIORITY[item.priority];
          return (
            <Reveal i={index}>
              <Tap onPress={() => router.push({ pathname: "/admin/complaint/[id]", params: { id: item.id } })} scale={0.985}>
                <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: item.unread ? t.primary + "55" : t.border, flexDirection: "row", gap: 12, shadowColor: t.shadow, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
                  <View>
                    <Avatar who={who} name={who?.name} size={46} />
                    {item.unread && <View style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: t.primary, borderWidth: 2.5, borderColor: t.surface }} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text v="small" style={{ fontFamily: item.unread ? font.heavy : font.semibold, flex: 1 }} numberOfLines={1}>{who?.name ?? "Resident"}{who?.unit ? ` · ${who.unit}` : ""}</Text>
                      <Text style={{ fontFamily: font.medium, fontSize: 11.5 }} color="mute">{timeAgo(last?.at ?? item.createdAt)}</Text>
                    </View>
                    <Text v="sub" numberOfLines={1} style={{ marginTop: 3, fontSize: 15, fontFamily: item.unread ? font.heavy : font.bold }}>{item.subject}</Text>
                    <Text v="small" color="sub" numberOfLines={2} style={{ marginTop: 3, lineHeight: 19 }}>{last?.from === "admin" ? "You: " : ""}{last?.text}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <Badge label={s.label} tone={s.tone} dot />
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: priorityColor(t, item.priority) }} />
                        <Text style={{ fontFamily: font.semibold, fontSize: 12 }} color="sub">{p.label} priority</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Tap>
            </Reveal>
          );
        }}
      />
      <PlaceReportsSheet placeId={place?.id} placeName={place?.name} visible={repOpen} onClose={() => setRepOpen(false)} />
    </View>
  );
}
