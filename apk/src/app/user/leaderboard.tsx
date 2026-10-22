import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router } from "expo-router";
import { Crown, Gamepad2, Trophy, Users } from "lucide-react-native";
import { SubHeader } from "@/features/user/SubHeader";
import { useUserCtx } from "@/features/user/data";
import { useBoard, type BoardRow } from "@/features/game/board";
import { font, radius, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Badge, EmptyState, Reveal } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Text } from "@/ui/Text";

type Scope = "city" | "mine";

const rerank = (rows: BoardRow[]): BoardRow[] => {
  const out: BoardRow[] = [];
  rows.forEach((r, i) => out.push({ ...r, rank: i > 0 && rows[i - 1].score === r.score ? out[i - 1].rank : i + 1 }));
  return out;
};

function Podium({ rows }: { rows: BoardRow[] }) {
  const { t, isDark } = useTheme();
  const order = [rows[1], rows[0], rows[2]];
  const heights = [78, 108, 62];
  const tints = ["#D4D3E3", t.gold, "#8A3A1A"];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
      {order.map((r, i) => {
        if (!r) return <View key={i} style={{ flex: 1 }} />;
        const first = i === 1;
        return (
          <Reveal key={r.id} i={i} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ height: 26, justifyContent: "flex-end" }}>{first ? <Crown size={22} color={t.gold} fill={t.gold} /> : null}</View>
            <Avatar name={r.nick} size={first ? 64 : 52} ring={r.me ? t.primary : tints[i]} />
            <Text numberOfLines={1} style={{ fontFamily: font.bold, fontSize: 13.5, marginTop: 6, maxWidth: "100%" }}>{r.nick}</Text>
            <Text style={{ fontFamily: font.heavy, fontSize: 15, fontVariant: ["tabular-nums"] }} color="sub">{r.score}</Text>
            <View style={{ width: "100%", height: heights[i], marginTop: 8, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: first ? t.gold : isDark ? t.surface2 : t.primarySoft, alignItems: "center", paddingTop: 10, borderWidth: first ? 0 : 1, borderBottomWidth: 0, borderColor: t.border }}>
              <Text style={{ fontFamily: font.heavy, fontSize: 24 }} color={first ? "#1B2433" : "sub"}>{r.rank}</Text>
            </View>
          </Reveal>
        );
      })}
    </View>
  );
}

function RowItem({ r, place }: { r: BoardRow; place?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 20, marginBottom: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: r.me ? t.primarySoft : t.surface, borderWidth: 1.5, borderColor: r.me ? t.primary : t.border }}>
      <Text style={{ width: 28, textAlign: "center", fontFamily: font.heavy, fontSize: 16, fontVariant: ["tabular-nums"] }} color={r.me ? "primary" : "sub"}>{r.rank}</Text>
      <Avatar name={r.nick} size={38} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text numberOfLines={1} style={{ fontFamily: font.bold, fontSize: 15, flexShrink: 1 }}>{r.nick}</Text>
          {r.me ? <Badge label="You" tone="primary" /> : null}
        </View>
        {place ? <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="mute" numberOfLines={1}>{place}</Text> : null}
      </View>
      <Text style={{ fontFamily: font.heavy, fontSize: 17, fontVariant: ["tabular-nums"] }}>{r.score}</Text>
    </View>
  );
}

export default function Leaderboard() {
  const { t } = useTheme();
  const { me, places } = useUserCtx();
  const { rows, mine, myNick } = useBoard();
  const [scope, setScope] = useState<Scope>("city");

  const list = useMemo(() => rerank(scope === "city" ? rows : rows.filter((r) => r.placeId === me?.placeId)), [rows, scope, me?.placeId]);
  const myRow = list.find((r) => r.me) ?? null;
  const placeName = (id: string | null) => places.find((p) => p.id === id)?.district;
  const top = list.slice(0, 3);
  const rest = list.slice(3);
  const myPlace = places.find((p) => p.id === me?.placeId);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader title="Leaderboard" subtitle="Tidy Town · best scores" right={<View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.goldSoft, alignItems: "center", justifyContent: "center" }}><Trophy size={20} color={t.gold} /></View>} />
      <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
        <Segmented value={scope} onChange={setScope} options={[{ value: "city", label: "Whole city", count: rows.length }, { value: "mine", label: myPlace ? "My residence" : "My place", count: rows.filter((r) => r.placeId === me?.placeId).length }]} />
      </View>

      <FlatList
        data={rest}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RowItem r={item} place={placeName(item.placeId)} />}
        ListHeaderComponent={top.length ? <View style={{ paddingBottom: 14 }}><Podium rows={top} /></View> : null}
        ListEmptyComponent={
          list.length === 0 ? (
            <EmptyState icon={Users} title="No players yet" text="Be the first from your residence to set a score." action={<Button label="Play Tidy Town" icon={Gamepad2} variant="gold" size="md" onPress={() => router.replace("/user/game")} />} />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.border }}>
        {myRow ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text v="label" color="mute">{scope === "city" ? "Your rank in the city" : "Your rank here"}</Text>
              <Text style={{ fontFamily: font.heavy, fontSize: 22 }}>#{myRow.rank} <Text style={{ fontFamily: font.semibold, fontSize: 14 }} color="sub">{myRow.nick} · {myRow.score} pts</Text></Text>
            </View>
            <Button label="Play" icon={Gamepad2} variant="gold" size="md" onPress={() => router.replace("/user/game")} />
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 15 }}>{mine || myNick ? "Set a score to appear here" : "Pick a nickname and play"}</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub">Only your nickname is shown, never your real name.</Text>
            </View>
            <Button label="Play" icon={Gamepad2} variant="gold" size="md" onPress={() => router.replace("/user/game")} />
          </View>
        )}
      </View>
    </View>
  );
}
