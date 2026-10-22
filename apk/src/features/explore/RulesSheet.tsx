import { useMemo, useState } from "react";
import { View } from "react-native";
import { Flag, Info, ScrollText } from "lucide-react-native";
import { PlaceReportCard } from "@/features/reports/PlaceReportCard";
import { RULE_META } from "@/lib/rulemeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Place } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Card, EmptyState, Reveal, toneColors } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Sheet } from "@/ui/Sheet";
import { Text } from "@/ui/Text";

export function RulesSheet({ place, action, visible, onClose }: { place: Place | undefined; action?: { label: string; onPress: () => void }; visible: boolean; onClose: () => void }) {
  const { t, isDark } = useTheme();
  const rules = place?.rules.visitors ?? [];
  const all = useApp((s) => s.placeReports);
  const remove = useApp((s) => s.removePlaceReport);
  const reports = useMemo(() => all.filter((r) => r.placeId === place?.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [all, place?.id]);
  const [tab, setTab] = useState<"rules" | "reports">("rules");
  return (
    <Sheet visible={visible} onClose={onClose} title={tab === "rules" ? "House rules" : "Resident reports"} subtitle={place ? (tab === "rules" ? `For visitors at ${place.name}` : `About ${place.name}`) : undefined} footer={action ? <Button label={action.label} variant="soft" icon={ScrollText} onPress={() => { onClose(); action.onPress(); }} /> : undefined}>
      <View style={{ gap: 10, paddingBottom: 6 }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: "rules", label: "Rules", count: rules.length }, { value: "reports", label: "Reports", count: reports.length }]} />
        {tab === "reports" ? (reports.length === 0 ? <EmptyState icon={Flag} title="No reports" text="Nobody has reported anything here." /> : reports.map((r) => <PlaceReportCard key={r.id} report={r} onDelete={() => remove(r.id)} />)) : (<>
        <View style={{ flexDirection: "row", gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: t.goldSoft, alignItems: "center" }}>
          <Info size={17} color={t.goldInk} />
          <Text v="small" color="goldInk" style={{ flex: 1, fontFamily: font.semibold, lineHeight: 18 }}>
            {place?.kind === "residential" ? "These are the rules for visitors. Resident-only rules stay private to the community." : "Everyone who visits is asked to follow these rules."}
          </Text>
        </View>
        {rules.length === 0 ? (
          <EmptyState icon={ScrollText} title="No rules published" text="This place hasn't added visitor rules yet." />
        ) : (
          rules.map((r, i) => {
            const m = RULE_META[r.category];
            const c = toneColors(t, isDark, m.tone);
            return (
              <Reveal i={i} key={r.id}>
                <Card pad={14} style={{ flexDirection: "row", gap: 13 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                    <m.icon size={21} color={c.fg} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text v="sub">{r.title}</Text>
                    <Text v="small" color="sub" style={{ marginTop: 4, lineHeight: 19 }}>{r.text}</Text>
                  </View>
                </Card>
              </Reveal>
            );
          })
        )}
        </>)}
      </View>
    </Sheet>
  );
}
