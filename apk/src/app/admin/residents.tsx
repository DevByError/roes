import { useMemo, useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Calendar, Home, Mail, Phone, Search, Users, X } from "lucide-react-native";
import { useAdminCtx } from "@/features/admin/data";
import { longDate, maskPhone, timeAgo } from "@/lib/format";
import { font, radius, useTheme } from "@/lib/theme";
import type { Account } from "@/lib/types";
import { Avatar } from "@/ui/Avatar";
import { Badge, EmptyState, Reveal, Row } from "@/ui/Misc";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

const WEEK = 7 * 86_400_000;

export default function Residents() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { residents, place } = useAdminCtx();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Account | null>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? residents.filter((r) => r.name.toLowerCase().includes(s) || (r.unit ?? "").toLowerCase().includes(s)) : residents;
  }, [q, residents]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: t.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace("/admin/home"))} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color={t.text} />
          </Tap>
          <View style={{ flex: 1 }}>
            <Text v="title">Residents</Text>
            <Text style={{ fontFamily: font.medium, fontSize: 13 }} color="sub">{residents.length} at {place?.name}</Text>
          </View>
        </View>
        <View style={{ marginTop: 16, height: 50, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 }}>
          <Search size={19} color={t.mute} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search by name or unit" placeholderTextColor={t.mute} style={[{ flex: 1, fontFamily: font.medium, fontSize: 15, color: t.text }, { outlineStyle: "none" } as object]} autoCorrect={false} />
          {q.length > 0 && (
            <Tap onPress={() => setQ("")} accessibilityLabel="Clear search"><X size={18} color={t.mute} /></Tap>
          )}
        </View>
      </View>
      <FlatList
        data={list}
        keyExtractor={(r) => r.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 30, gap: 8 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState icon={Users} title={q ? "No one matches that" : "No residents yet"} text={q ? "Check the spelling or try a unit number." : "Residents appear here once they register and choose your building."} />}
        renderItem={({ item, index }) => {
          const fresh = Date.now() - +new Date(item.joinedAt) < WEEK;
          return (
            <Reveal i={Math.min(index, 8)}>
              <Tap onPress={() => setSel(item)} scale={0.985}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 13, padding: 12, borderRadius: radius.lg, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
                  <Avatar who={item} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text v="sub" numberOfLines={1}>{item.name}</Text>
                    <Text style={{ fontFamily: font.medium, fontSize: 13 }} color="sub">{item.unit ? `Unit ${item.unit}` : "No unit"} · joined {timeAgo(item.joinedAt)}</Text>
                  </View>
                  {fresh && <Badge label="New" tone="gold" />}
                </View>
              </Tap>
            </Reveal>
          );
        }}
      />
      <Sheet visible={!!sel} onClose={() => setSel(null)}>
        {sel && (
          <View style={{ paddingBottom: 10 }}>
            <View style={{ alignItems: "center", paddingBottom: 18 }}>
              <Avatar who={sel} size={88} ring={t.gold} />
              <Text v="heading" style={{ marginTop: 12 }}>{sel.name}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 13.5 }} color="sub">{sel.status === "active" ? "Active resident" : "Account frozen"}</Text>
            </View>
            <View style={{ borderRadius: radius.lg, backgroundColor: t.surface2, paddingHorizontal: 14 }}>
              <Row icon={Home} label="Unit" value={sel.unit ?? "—"} />
              <Row icon={Mail} label="Email" value={sel.email} tone="info" />
              <Row icon={Phone} label="Phone" value={maskPhone(sel.phone)} tone="success" />
              <Row icon={Calendar} label="Joined" value={longDate(sel.joinedAt)} tone="gold" />
            </View>
            <Text style={{ fontFamily: font.medium, fontSize: 12.5, textAlign: "center", marginTop: 14, lineHeight: 18 }} color="mute">Residents manage their own details. You can only view them here.</Text>
          </View>
        )}
      </Sheet>
    </View>
  );
}
