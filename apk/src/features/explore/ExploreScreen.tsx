import { useEffect, useMemo, useState } from "react";
import { Keyboard, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Building2, ChevronRight, Crown, Landmark, MapPin, ScrollText, Search, X } from "lucide-react-native";
import { CityMap, type MapFocus } from "./CityMap";
import { RulesSheet } from "./RulesSheet";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { distanceKm } from "@/lib/map-config";
import { RULE_META } from "@/lib/rulemeta";
import { useApp, useMe } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Place } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Badge, toneColors } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

type Filter = "all" | "residential" | "public";
const FILTERS: { k: Filter; label: string }[] = [
  { k: "all", label: "All places" },
  { k: "residential", label: "Residences" },
  { k: "public", label: "Public places" },
];

const km = (n: number) => (n < 1 ? `${Math.round(n * 1000)} m` : `${n.toFixed(1)} km`);

export function ExploreScreen({ ownAction }: { ownAction?: { label: string; onPress: () => void } }) {
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const me = useMe();
  const places = useApp((s) => s.places);
  const { place: placeParam } = useLocalSearchParams<{ place?: string }>();

  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const own = places.find((p) => p.id === me?.placeId);

  const pick = (id: string) => {
    setSelectedId(id);
    setFocus({ id, key: Date.now() });
    setTyping(false);
    setQuery("");
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (placeParam) {
      pick(placeParam);
      router.setParams({ place: undefined });
    }
  }, [placeParam]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => (filter === "all" || (filter === "residential" ? p.kind === "residential" : p.kind !== "residential")) && (!q || `${p.name} ${p.district} ${p.category}`.toLowerCase().includes(q)));
  }, [places, filter, query]);

  const results = useMemo(() => {
    if (!own) return visible;
    return [...visible].sort((a, b) => distanceKm(own, a) - distanceKm(own, b));
  }, [visible, own]);

  const selected = places.find((p) => p.id === selectedId);
  const showResults = typing;
  const bottomOffset = TAB_SPACE - 6;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <CityMap
        places={visible}
        selectedId={selectedId}
        ownId={me?.placeId ?? undefined}
        focus={focus}
        onSelect={(id) => { setSelectedId(id); if (id) setFocus({ id, key: Date.now() }); setTyping(false); Keyboard.dismiss(); }}
        controlsBottom={selected ? bottomOffset + 284 : bottomOffset + 8}
      />

      <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: insets.top + 10, paddingHorizontal: 16 }}>
        <View style={{ height: 54, borderRadius: 27, backgroundColor: isDark ? t.surface2 : t.surface, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, gap: 12, shadowColor: t.shadow, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
          <Search size={20} color={t.primary} strokeWidth={2.5} />
          <TextInput
            value={query}
            onChangeText={(v) => { setQuery(v); setTyping(true); }}
            onFocus={() => setTyping(true)}
            placeholder="Search a place or area"
            placeholderTextColor={t.mute}
            autoCorrect={false}
            returnKeyType="search"
            style={[{ flex: 1, fontFamily: font.semibold, fontSize: 15.5, color: t.text, height: 54 }, { outlineStyle: "none" } as object]}
          />
          {(query.length > 0 || typing) && (
            <Tap accessibilityLabel="Clear search" onPress={() => { setQuery(""); setTyping(false); Keyboard.dismiss(); }} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
              <X size={16} color={t.sub} />
            </Tap>
          )}
        </View>

        {!showResults && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12, paddingHorizontal: 2 }} style={{ marginHorizontal: -16 }} contentInset={{ left: 16 }}>
            <View style={{ width: 14 }} />
            {FILTERS.map((f) => {
              const on = filter === f.k;
              return (
                <Tap key={f.k} haptic="select" onPress={() => setFilter(f.k)} style={{ height: 38, paddingHorizontal: 16, borderRadius: 19, justifyContent: "center", backgroundColor: on ? t.primary : isDark ? t.surface2 : t.surface, shadowColor: t.shadow, shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 }}>
                  <Text v="small" style={{ fontFamily: font.bold }} color={on ? "onPrimary" : "sub"}>{f.label}</Text>
                </Tap>
              );
            })}
          </ScrollView>
        )}

        {showResults && (
          <Animated.View entering={FadeInDown.duration(180)} style={{ marginTop: 10, maxHeight: 360, borderRadius: radius.lg, backgroundColor: isDark ? t.surface2 : t.surface, overflow: "hidden", shadowColor: t.shadow, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={{ fontFamily: font.bold, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }} color="mute">{query ? `${results.length} found` : "Places near you"}</Text>
              {results.length === 0 && <Text v="small" color="sub" style={{ padding: 18, textAlign: "center" }}>Nothing matches “{query}”.</Text>}
              {results.map((p, i) => (
                <ResultRow key={p.id} place={p} own={p.id === me?.placeId} dist={own && p.id !== own.id ? distanceKm(own, p) : null} first={i === 0} onPress={() => pick(p.id)} />
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {selected && !showResults && (
        <PlaceCard key={selected.id} place={selected} own={selected.id === me?.placeId} dist={own && selected.id !== own.id ? distanceKm(own, selected) : null} bottom={bottomOffset} onClose={() => setSelectedId(null)} onRules={() => setRulesOpen(true)} />
      )}
      <RulesSheet place={selected} action={selected?.id === me?.placeId ? ownAction : undefined} visible={rulesOpen} onClose={() => setRulesOpen(false)} />
    </View>
  );
}

function KindIcon({ place, own, size = 44 }: { place: Place; own: boolean; size?: number }) {
  const { t } = useTheme();
  const res = place.kind === "residential";
  const bg = own ? t.gold : res ? t.mapRes : t.mapPublic;
  const Icon = own ? Crown : res ? Building2 : Landmark;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.34, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Icon size={size * 0.48} color={own ? "#1B2433" : t.onMap} strokeWidth={2.3} />
    </View>
  );
}

function ResultRow({ place, own, dist, first, onPress }: { place: Place; own: boolean; dist: number | null; first: boolean; onPress: () => void }) {
  const { t } = useTheme();
  return (
    <Tap onPress={onPress} scale={0.99} style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: t.border }}>
      <KindIcon place={place} own={own} size={42} />
      <View style={{ flex: 1 }}>
        <Text v="sub" numberOfLines={1}>{place.name}</Text>
        <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{place.category} · {place.district}</Text>
      </View>
      {own ? <Badge label="Your place" tone="gold" /> : dist !== null ? <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color="mute">{km(dist)}</Text> : null}
    </Tap>
  );
}

function PlaceCard({ place, own, dist, bottom, onClose, onRules }: { place: Place; own: boolean; dist: number | null; bottom: number; onClose: () => void; onRules: () => void }) {
  const { t, isDark } = useTheme();
  const rules = place.rules.visitors;
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOutDown.duration(160)} style={{ position: "absolute", left: 14, right: 14, bottom, borderRadius: 28, padding: 16, backgroundColor: isDark ? t.surface2 : t.surface, shadowColor: t.shadow, shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <KindIcon place={place} own={own} />
        <View style={{ flex: 1 }}>
          <Text v="sub" numberOfLines={1} style={{ fontSize: 16.5 }}>{place.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
            <MapPin size={13} color={t.mute} />
            <Text style={{ fontFamily: font.medium, fontSize: 12.5, flex: 1 }} color="sub" numberOfLines={1}>{place.category} · {place.district}{dist !== null ? ` · ${km(dist)} from you` : ""}</Text>
          </View>
        </View>
        <Tap accessibilityLabel="Close" onPress={onClose} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
          <X size={17} color={t.sub} />
        </Tap>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        {own && <Badge label="Your place" tone="gold" icon={Crown} />}
        <Badge label={place.kind === "residential" ? "Residence" : "Public place"} tone={place.kind === "residential" ? "primary" : "success"} />
        <Badge label={`${rules.length} visitor rule${rules.length === 1 ? "" : "s"}`} tone="neutral" icon={ScrollText} />
      </View>

      {rules.slice(0, 2).map((r) => {
        const m = RULE_META[r.category];
        const c = toneColors(t, isDark, m.tone);
        return (
          <View key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: 11, marginTop: 10 }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
              <m.icon size={15} color={c.fg} strokeWidth={2.3} />
            </View>
            <Text v="small" numberOfLines={1} style={{ flex: 1, fontFamily: font.semibold }}>{r.title}</Text>
          </View>
        );
      })}

      <View style={{ marginTop: 14 }}>
        <Button label="See house rules" icon={ScrollText} iconRight={ChevronRight} onPress={onRules} />
      </View>
    </Animated.View>
  );
}
