import { useMemo } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { ArrowDownRight, ArrowUpRight, Bell, Building2, CheckCircle2, Eye, Megaphone, MessageSquareWarning, MapPin, ScrollText, UserPlus, Users, type LucideIcon } from "lucide-react-native";
import { useAdminAnnouncements, useAdminCtx } from "@/features/admin/data";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { firstName, greeting, shortDate, timeAgo } from "@/lib/format";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import { AvatarMenu } from "@/features/profile/AvatarMenu";
import { Avatar } from "@/ui/Avatar";
import { Bars, Sparkline } from "@/ui/Charts";
import { Badge, Card, EmptyState, Reveal, SectionTitle, toneColors, type Tone } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { useScrollReset } from "@/lib/useScrollReset";

const DAY = 86_400_000;

export default function AdminHome() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const ctx = useAdminCtx();
  const ann = useAdminAnnouncements();
  const { me, place, residential } = ctx;
  const accounts = useApp((s) => s.accounts);

  const kpis = useMemo(() => {
    const list: { key: string; label: string; value: number; icon: LucideIcon; tone: Tone; hint: string; onPress: () => void; spark?: number[]; delta?: number }[] = [];
    if (residential) {
      list.push({ key: "res", label: "Residents", value: ctx.residents.length, icon: Users, tone: "primary", hint: `+${ctx.newThisMonth} this month`, onPress: () => router.push("/admin/residents"), spark: ctx.weekly.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? ctx.residents.length - ctx.weekly.reduce((a, b) => a + b, 0)) + v], []), delta: ctx.newThisMonth - ctx.prevMonth });
    }
    list.push(
      { key: "open", label: "Open complaints", value: ctx.open.length, icon: MessageSquareWarning, tone: ctx.open.length ? "warn" : "success", hint: ctx.unread ? `${ctx.unread} unread` : "All read", onPress: () => router.navigate("/admin/inbox") },
      { key: "rules", label: residential ? "House rules" : "Visitor rules", value: residential ? ctx.rulesTotal : place?.rules.visitors.length ?? 0, icon: ScrollText, tone: "gold", hint: residential ? `${place?.rules.residents.length} resident · ${place?.rules.visitors.length} visitor` : "shown to visitors", onPress: () => router.navigate("/admin/rules") },
      { key: "notices", label: "Live notices", value: ctx.notices.length, icon: Megaphone, tone: "info", hint: ctx.notices.some((n) => n.pinned) ? "1 pinned" : residential ? "private to residents" : "public", onPress: () => router.navigate("/admin/notices") },
    );
    return list;
  }, [ctx, place, residential]);

  const activity = useMemo(() => {
    const items: { id: string; at: string; icon: LucideIcon; tone: Tone; title: string; sub: string }[] = [];
    ctx.notices.slice(0, 4).forEach((n) => items.push({ id: n.id, at: n.createdAt, icon: Megaphone, tone: "primary", title: n.title, sub: n.audience === "private" ? "Notice sent to residents" : "Public notice published" }));
    ctx.complaints.slice(0, 5).forEach((c) => items.push({ id: c.id, at: c.createdAt, icon: MessageSquareWarning, tone: c.status === "resolved" ? "success" : "warn", title: c.subject, sub: `${accounts.find((a) => a.id === c.fromId)?.name ?? "Resident"} · ${c.status === "resolved" ? "resolved" : "complaint"}` }));
    if (residential) ctx.residents.slice(0, 3).forEach((r) => items.push({ id: r.id, at: r.joinedAt, icon: UserPlus, tone: "info", title: `${r.name} joined`, sub: `Unit ${r.unit}` }));
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);
  }, [ctx, accounts, residential]);

  const attention = ctx.open.filter((c) => c.status === "new" || c.priority === "high").slice(0, 3);
  if (!me || !place) return null;

  const quick: { label: string; sub: string; icon: LucideIcon; tone: Tone; onPress: () => void }[] = [
    { label: "Post a notice", sub: residential ? "To all residents" : "To the public", icon: Megaphone, tone: "primary", onPress: () => router.navigate({ pathname: "/admin/notices", params: { compose: String(Date.now()) } }) },
    { label: "Add a rule", sub: residential ? "Residents or visitors" : "For visitors", icon: ScrollText, tone: "gold", onPress: () => router.navigate({ pathname: "/admin/rules", params: { add: String(Date.now()) } }) },
    residential
      ? { label: "Residents", sub: `${ctx.residents.length} people`, icon: Users, tone: "info", onPress: () => router.push("/admin/residents") }
      : { label: "Preview", sub: "How visitors see you", icon: Eye, tone: "info", onPress: () => router.navigate({ pathname: "/admin/explore", params: { place: ctx.me?.placeId ?? "" } }) },
    { label: "Inbox", sub: `${ctx.open.length} to handle`, icon: MessageSquareWarning, tone: ctx.open.length ? "warn" : "success", onPress: () => router.navigate("/admin/inbox") },
  ];

  const grow = ctx.newThisMonth - ctx.prevMonth;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style="light" />
      <ScrollView key={rk} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_SPACE + insets.bottom }}>
        <LinearGradient colors={t.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 66, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: "hidden" }}>
          <Svg width={width} height={300} style={{ position: "absolute", right: -width * 0.38, top: -50 }}>
            {[70, 115, 160, 205].map((r) => <Circle key={r} cx={width * 0.62} cy={120} r={r} stroke="#fff" strokeOpacity={0.06} strokeWidth={1.2} fill="none" />)}
          </Svg>
          <Reveal>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
              <AvatarMenu profile="/admin/me">
                <Avatar who={me} size={48} ring={t.gold} />
              </AvatarMenu>
              <View style={{ flex: 1 }}>
                <Text v="small" color="rgba(255,255,255,0.62)">{greeting()},</Text>
                <Text v="heading" color="#fff" numberOfLines={1}>{firstName(me.name)}</Text>
              </View>
              <Tap onPress={() => router.push("/admin/notifications")} accessibilityLabel="Notifications" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
                <Bell size={20} color="#fff" />
                {ann.unseenMayor > 0 && (
                  <View style={{ position: "absolute", top: 2, right: 0, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: t.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: t.heroAdmin[0] }}>
                    <Text style={{ fontFamily: font.heavy, fontSize: 10, lineHeight: 13 }} color="#1B2433">{ann.unseenMayor}</Text>
                  </View>
                )}
              </Tap>
            </View>
          </Reveal>

          <Reveal i={1} style={{ marginTop: 22 }}>
            <View style={{ padding: 18, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
              <Text v="label" color={t.gold}>You manage</Text>
              <Text style={{ fontFamily: font.heavy, fontSize: 23, lineHeight: 29, letterSpacing: -0.5, marginTop: 6 }} color="#fff">{place.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,0.65)" />
                <Text v="small" color="rgba(255,255,255,0.7)" numberOfLines={1} style={{ flex: 1 }}>{place.address}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 99, backgroundColor: t.gold + "2E" }}>
                  <Building2 size={13} color={t.gold} />
                  <Text style={{ fontFamily: font.bold, fontSize: 12 }} color={t.gold}>{residential ? "Residential" : "Public place"}</Text>
                </View>
                <View style={{ paddingVertical: 5, paddingHorizontal: 11, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <Text style={{ fontFamily: font.semibold, fontSize: 12 }} color="rgba(255,255,255,0.85)">{place.category}</Text>
                </View>
              </View>
            </View>
          </Reveal>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={168} decelerationRate="fast" style={{ marginTop: -38 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingVertical: 8 }}>
          {kpis.map((k, i) => {
            const c = toneColors(t, isDark, k.tone);
            return (
              <Reveal i={i + 2} key={k.key}>
                <Tap onPress={k.onPress} style={{ width: 156 }}>
                  <Card pad={15} style={{ height: 156, justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                        <k.icon size={19} color={c.fg} strokeWidth={2.3} />
                      </View>
                      {k.delta !== undefined && k.delta !== 0 && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                          {k.delta > 0 ? <ArrowUpRight size={14} color={t.success} /> : <ArrowDownRight size={14} color={t.danger} />}
                          <Text style={{ fontFamily: font.bold, fontSize: 12 }} color={k.delta > 0 ? "successInk" : "danger"}>{Math.abs(k.delta)}</Text>
                        </View>
                      )}
                    </View>
                    <View>
                      <Text v="num" style={{ fontSize: 34, lineHeight: 38 }}>{k.value}</Text>
                      <Text v="small" style={{ fontFamily: font.bold, marginTop: 2 }}>{k.label}</Text>
                      <Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 11.5, marginTop: 2 }} color="mute">{k.hint}</Text>
                    </View>
                    {k.spark && <View style={{ position: "absolute", right: 6, top: 52, opacity: 0.95 }}><Sparkline data={k.spark} color={t.primary} width={86} height={38} /></View>}
                  </Card>
                </Tap>
              </Reveal>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, gap: 28, marginTop: 14 }}>
          <Reveal i={4}>
            <SectionTitle title="Quick actions" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {quick.map((q) => {
                const c = toneColors(t, isDark, q.tone);
                return (
                  <Tap key={q.label} onPress={q.onPress} style={{ width: (width - 52) / 2 }}>
                    <View style={{ padding: 14, borderRadius: radius.lg - 2, backgroundColor: c.bg, gap: 14 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
                        <q.icon size={20} color={c.fg} strokeWidth={2.3} />
                      </View>
                      <View>
                        <Text v="sub" color={c.fg}>{q.label}</Text>
                        <Text style={{ fontFamily: font.medium, fontSize: 12.5, marginTop: 1 }} color={c.fg}>{q.sub}</Text>
                      </View>
                    </View>
                  </Tap>
                );
              })}
            </View>
          </Reveal>

          <Reveal i={5}>
            <SectionTitle title="Needs your attention" action={attention.length ? "See inbox" : undefined} onAction={() => router.navigate("/admin/inbox")} />
            {attention.length === 0 ? (
              <Card><EmptyState icon={CheckCircle2} title="You're all caught up" text="No new or urgent complaints right now." /></Card>
            ) : (
              <Card pad={6}>
                {attention.map((c, i) => {
                  const who = accounts.find((a) => a.id === c.fromId);
                  const pc = c.priority === "high" ? t.danger : c.priority === "medium" ? t.warn : t.info;
                  return (
                    <Tap key={c.id} onPress={() => router.push({ pathname: "/admin/complaint/[id]", params: { id: c.id } })} scale={0.985} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 11, borderTopWidth: i ? 1 : 0, borderTopColor: t.border }}>
                      <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: pc }} />
                      {who && <Avatar who={who} size={38} />}
                      <View style={{ flex: 1 }}>
                        <Text v="small" numberOfLines={1} style={{ fontFamily: font.bold, fontSize: 14 }}>{c.subject}</Text>
                        <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="mute" numberOfLines={1}>{who?.name} · {timeAgo(c.createdAt)}</Text>
                      </View>
                      {c.unread && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.primary }} />}
                    </Tap>
                  );
                })}
              </Card>
            )}
          </Reveal>

          {residential && (
            <Reveal i={6}>
              <SectionTitle title="Community growth" />
              <Card>
                <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
                  <View>
                    <Text v="num">{ctx.newThisMonth}</Text>
                    <Text v="small" color="sub">new residents in 30 days</Text>
                  </View>
                  <Badge label={grow === 0 ? "Same as last month" : `${grow > 0 ? "+" : ""}${grow} vs last month`} tone={grow >= 0 ? "success" : "danger"} icon={grow >= 0 ? ArrowUpRight : ArrowDownRight} />
                </View>
                <Bars data={ctx.weekly} color={t.primary} muted={t.barMuted} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 11 }} color="mute">8 weeks ago</Text>
                  <Text style={{ fontFamily: font.medium, fontSize: 11 }} color="mute">This week</Text>
                </View>
              </Card>
            </Reveal>
          )}

          <Reveal i={7}>
            <SectionTitle title="Recent activity" />
            <Card>
              {activity.map((a, i) => {
                const c = toneColors(t, isDark, a.tone);
                return (
                  <View key={a.id} style={{ flexDirection: "row", gap: 13 }}>
                    <View style={{ alignItems: "center" }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                        <a.icon size={16} color={c.fg} strokeWidth={2.4} />
                      </View>
                      {i < activity.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: t.border, marginVertical: 3, borderRadius: 1 }} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: i < activity.length - 1 ? 14 : 0 }}>
                      <Text v="small" numberOfLines={2} style={{ fontFamily: font.bold, fontSize: 14, lineHeight: 19 }}>{a.title}</Text>
                      <Text style={{ fontFamily: font.medium, fontSize: 12, marginTop: 2 }} color="mute">{a.sub} · {timeAgo(a.at)}</Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </Reveal>
          <View style={{ height: 4 }} />
        </View>
      </ScrollView>
    </View>
  );
}
