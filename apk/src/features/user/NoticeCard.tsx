import { View } from "react-native";
import { Building2, Landmark, Lock, Pin, Shield } from "lucide-react-native";
import { shortDate, timeAgo } from "@/lib/format";
import { font, radius, useTheme } from "@/lib/theme";
import type { Notice } from "@/lib/types";
import { Badge } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

export type NoticeSource = "city" | "mine" | "place";
export const sourceKind = (n: Notice, myPlaceId: string | null): NoticeSource => (n.placeId === "city" ? "city" : n.placeId === myPlaceId ? "mine" : "place");

export function SourceBadge({ kind, label }: { kind: NoticeSource; label: string }) {
  if (kind === "city") return <Badge label="City Hall" tone="gold" icon={Landmark} />;
  if (kind === "mine") return <Badge label="My residence" tone="primary" icon={Lock} />;
  return <Badge label={label} tone="success" icon={Building2} />;
}

export function NoticeCard({ notice, kind, source, unread, onPress, compact }: { notice: Notice; kind: NoticeSource; source: string; unread: boolean; onPress: () => void; compact?: boolean }) {
  const { t, isDark } = useTheme();
  return (
    <Tap onPress={onPress} scale={0.985}>
      <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: notice.pinned ? t.gold + "88" : unread ? t.primary + "44" : t.border, overflow: "hidden", shadowColor: t.shadow, shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 }}>
        {notice.pinned && <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: t.gold }} />}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <SourceBadge kind={kind} label={source} />
          {notice.pinned && <Badge label="Pinned" tone="gold" icon={Pin} />}
          <View style={{ flex: 1 }} />
          {unread && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.primary }} />}
          <Text style={{ fontFamily: font.medium, fontSize: 12, flexShrink: 0 }} color="mute" numberOfLines={1}>{timeAgo(notice.createdAt)}</Text>
        </View>
        <Text v="sub" style={{ lineHeight: 22, fontFamily: unread ? font.heavy : font.bold }}>{notice.title}</Text>
        {!compact && <Text v="small" color="sub" numberOfLines={3} style={{ marginTop: 6, lineHeight: 20 }}>{notice.body}</Text>}
        {!compact && <Text style={{ fontFamily: font.medium, fontSize: 11.5, marginTop: 12 }} color="mute">Posted {shortDate(notice.createdAt)}</Text>}
      </View>
    </Tap>
  );
}

export function SafetyIcon() {
  const { t } = useTheme();
  return <Shield size={18} color={t.sub} />;
}
