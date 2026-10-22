import { View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { firstName, timeAgo } from "@/lib/format";
import { RULE_META } from "@/lib/rulemeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { PlaceReport } from "@/lib/types";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

export function PlaceReportCard({ report, onDelete }: { report: PlaceReport; onDelete?: () => void }) {
  const { t, isDark } = useTheme();
  const who = useApp((s) => s.accounts.find((a) => a.id === report.fromId));
  const me = useApp((s) => s.sessionId);
  const m = RULE_META[report.category];
  const mine = report.fromId === me;
  return (
    <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: t.border, shadowColor: t.shadow, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Badge label={m.label} tone={m.tone} icon={m.icon} />
        <View style={{ flex: 1 }} />
        <Text style={{ fontFamily: font.medium, fontSize: 12, flexShrink: 0 }} color="mute">{timeAgo(report.createdAt)}</Text>
      </View>
      <Text v="sub" style={{ lineHeight: 22 }}>{report.subject}</Text>
      <Text v="small" color="sub" style={{ marginTop: 6, lineHeight: 20 }}>{report.details}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        <Avatar who={who} size={24} />
        <Text style={{ fontFamily: font.semibold, fontSize: 12.5, flex: 1 }} color="sub" numberOfLines={1}>{mine ? "You" : firstName(who?.name ?? "A resident")}{who?.unit && !mine ? ` · ${who.unit}` : ""}</Text>
        {mine && onDelete ? (
          <Tap onPress={onDelete} haptic="select" accessibilityLabel="Delete my report" style={{ flexDirection: "row", alignItems: "center", gap: 5, height: 30, paddingHorizontal: 10, borderRadius: 15, backgroundColor: t.dangerSoft }}>
            <Trash2 size={13} color={t.danger} />
            <Text style={{ fontFamily: font.bold, fontSize: 12 }} color="danger">Delete</Text>
          </Tap>
        ) : null}
      </View>
    </View>
  );
}
