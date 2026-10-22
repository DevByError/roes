import { useMemo } from "react";
import { View } from "react-native";
import { Flag } from "lucide-react-native";
import { useApp } from "@/lib/store";
import { EmptyState } from "@/ui/Misc";
import { Sheet } from "@/ui/Sheet";
import { PlaceReportCard } from "./PlaceReportCard";

export function PlaceReportsSheet({ placeId, placeName, visible, onClose }: { placeId?: string; placeName?: string; visible: boolean; onClose: () => void }) {
  const all = useApp((s) => s.placeReports);
  const remove = useApp((s) => s.removePlaceReport);
  const list = useMemo(() => all.filter((r) => r.placeId === placeId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [all, placeId]);
  return (
    <Sheet visible={visible} onClose={onClose} title="Resident reports" subtitle={placeName ? `About ${placeName}` : undefined}>
      <View style={{ gap: 12, paddingBottom: 8 }}>
        {list.length === 0 ? <EmptyState icon={Flag} title="No reports" text="Nobody has reported anything here." /> : list.map((r) => <PlaceReportCard key={r.id} report={r} onDelete={() => remove(r.id)} />)}
      </View>
    </Sheet>
  );
}
