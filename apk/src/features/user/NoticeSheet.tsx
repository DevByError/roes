import { View } from "react-native";
import { longDate } from "@/lib/format";
import { font } from "@/lib/theme";
import type { Notice } from "@/lib/types";
import { Sheet } from "@/ui/Sheet";
import { Text } from "@/ui/Text";
import { SourceBadge, type NoticeSource } from "./NoticeCard";

export function NoticeSheet({ notice, kind, source, onClose }: { notice: Notice | null; kind: NoticeSource; source: string; onClose: () => void }) {
  return (
    <Sheet visible={!!notice} onClose={onClose}>
      {notice && (
        <View style={{ paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
            <SourceBadge kind={kind} label={source} />
          </View>
          <Text v="heading" style={{ lineHeight: 28 }}>{notice.title}</Text>
          <Text style={{ fontFamily: font.medium, fontSize: 12.5, marginTop: 6 }} color="mute">{longDate(notice.createdAt)}</Text>
          <Text v="body" style={{ marginTop: 16, lineHeight: 26 }} color="text">{notice.body}</Text>
        </View>
      )}
    </Sheet>
  );
}
