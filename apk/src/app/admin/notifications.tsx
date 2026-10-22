import { useState } from "react";
import { FlatList, View } from "react-native";
import { BellOff, CheckCheck } from "lucide-react-native";
import { useAdminAnnouncements } from "@/features/admin/data";
import { NoticeCard } from "@/features/user/NoticeCard";
import { NoticeSheet } from "@/features/user/NoticeSheet";
import { SubHeader } from "@/features/user/SubHeader";
import { useApp } from "@/lib/store";
import { font, useTheme } from "@/lib/theme";
import type { Notice } from "@/lib/types";
import { EmptyState, Reveal } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";

type Tab = "all" | "city" | "mine";

export default function AdminNotifications() {
  const { t } = useTheme();
  const a = useAdminAnnouncements();
  const markSeen = useApp((s) => s.markSeen);
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<Notice | null>(null);

  const list = tab === "all" ? a.all : tab === "city" ? a.mayor : a.mine;
  const label = (n: Notice) => (n.placeId === "city" ? "From the Mayor" : "Posted by you");
  const kind = (n: Notice) => (n.placeId === "city" ? ("city" as const) : ("place" as const));
  const readAll = () => {
    a.mayor.forEach((n) => markSeen(n.id));
    buzz("success");
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader
        title="Notifications"
        subtitle={a.unseenMayor ? `${a.unseenMayor} new from the Mayor` : "You're all caught up"}
        right={a.unseenMayor ? (
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
            <Segmented value={tab} onChange={setTab} options={[{ value: "all", label: "All", count: a.all.length }, { value: "city", label: "Mayor", count: a.mayor.length }, { value: "mine", label: "My place", count: a.mine.length }]} />
          </View>
        }
        ListEmptyComponent={<EmptyState icon={BellOff} title="Nothing here" text="Announcements from the mayor's office will show up here." />}
        renderItem={({ item, index }) => (
          <Reveal i={index}>
            <NoticeCard notice={item} kind={kind(item)} source={label(item)} unread={item.placeId === "city" && !a.isSeen(item)} onPress={() => { markSeen(item.id); setOpen(item); }} />
          </Reveal>
        )}
      />
      <NoticeSheet notice={open} kind={open ? kind(open) : "city"} source={open ? label(open) : ""} onClose={() => setOpen(null)} />
    </View>
  );
}
