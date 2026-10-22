import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { BellOff, CheckCheck } from "lucide-react-native";
import { NoticeCard, sourceKind } from "@/features/user/NoticeCard";
import { NoticeSheet } from "@/features/user/NoticeSheet";
import { SubHeader } from "@/features/user/SubHeader";
import { useUserCtx } from "@/features/user/data";
import { useApp } from "@/lib/store";
import { font, useTheme } from "@/lib/theme";
import type { Notice } from "@/lib/types";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { EmptyState, Reveal } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { buzz } from "@/ui/haptics";

type Tab = "all" | "city" | "mine";

export default function Notifications() {
  const { t } = useTheme();
  const ctx = useUserCtx();
  const markSeen = useApp((s) => s.markSeen);
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<Notice | null>(null);
  const myPlaceId = ctx.me?.placeId ?? null;

  const counts = useMemo(() => {
    const c = { all: ctx.announcements.length, city: 0, mine: 0 };
    ctx.announcements.forEach((n) => { c[n.placeId === "city" ? "city" : "mine"]++; });
    return c;
  }, [ctx.announcements]);
  const list = ctx.announcements.filter((n) => tab === "all" || (tab === "city" ? n.placeId === "city" : n.placeId !== "city"));

  const readAll = () => {
    ctx.announcements.forEach((n) => markSeen(n.id));
    buzz("success");
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader
        title="Notifications"
        subtitle={ctx.unseenAnnouncements ? `${ctx.unseenAnnouncements} new announcement${ctx.unseenAnnouncements > 1 ? "s" : ""}` : "You're all caught up"}
        right={ctx.unseenAnnouncements ? (
          <Tap onPress={readAll} haptic="none" accessibilityLabel="Mark all as read" style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 12, borderRadius: 19, backgroundColor: t.primarySoft }}>
            <CheckCheck size={16} color={t.primary} />
            <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color="primary">Read all</Text>
          </Tap>
        ) : undefined}
      />
      <FlatList
        data={list}
        keyExtractor={(n) => n.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
        ListHeaderComponent={
          <View style={{ paddingBottom: 6 }}>
            <Segmented value={tab} onChange={setTab} options={[{ value: "all", label: "All", count: counts.all }, { value: "city", label: "Mayor", count: counts.city }, { value: "mine", label: "My admin", count: counts.mine }]} />
          </View>
        }
        ListEmptyComponent={<EmptyState icon={BellOff} title="Nothing here" text="Announcements from the mayor and your residence admin will show up here." />}
        renderItem={({ item, index }) => (
          <Reveal i={index}>
            <NoticeCard notice={item} kind={sourceKind(item, myPlaceId)} source={item.placeId === "city" ? "From the Mayor" : `From your admin · ${ctx.sourceOf(item)}`} unread={!ctx.isSeen(item)} onPress={() => { markSeen(item.id); setOpen(item); }} />
          </Reveal>
        )}
      />
      <NoticeSheet notice={open} kind={open ? sourceKind(open, myPlaceId) : "city"} source={open ? (open.placeId === "city" ? "From the Mayor" : `From your admin · ${ctx.sourceOf(open)}`) : ""} onClose={() => setOpen(null)} />
    </View>
  );
}
