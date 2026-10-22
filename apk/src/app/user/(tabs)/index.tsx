import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Gamepad2, HandHeart, MessageSquareWarning, Newspaper, ScrollText, ShieldAlert, Users, type LucideIcon } from "lucide-react-native";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { NoticeCard, sourceKind } from "@/features/user/NoticeCard";
import { NoticeSheet } from "@/features/user/NoticeSheet";
import { useUserCtx } from "@/features/user/data";
import { firstName, greeting, timeAgo } from "@/lib/format";
import { STATUS } from "@/lib/complaintmeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Notice } from "@/lib/types";
import { AvatarMenu } from "@/features/profile/AvatarMenu";
import { Avatar } from "@/ui/Avatar";
import { Badge, Card, Reveal, SectionTitle, toneColors, type Tone } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { useScrollReset } from "@/lib/useScrollReset";

interface Action {
  label: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
  go: () => void;
}

export default function UserHome() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const ctx = useUserCtx();
  const markSeen = useApp((s) => s.markSeen);
  const [open, setOpen] = useState<Notice | null>(null);
  const { me, place } = ctx;
  if (!me) return null;

  const actions: Action[] = [
    { label: "Report an issue", sub: "Admin, place or mayor", icon: MessageSquareWarning, tone: "warn", go: () => router.push("/user/complaint/new") },
    { label: "Neighbor report", sub: "Chat with a mediator", icon: Users, tone: "primary", go: () => router.push("/user/report/new") },
    { label: "House rules", sub: `${place?.rules.residents.length ?? 0} for residents`, icon: ScrollText, tone: "gold", go: () => router.navigate({ pathname: "/user/community", params: { tab: "rules" } }) },
    { label: "Safety", sub: "Emergency & policies", icon: ShieldAlert, tone: "danger", go: () => router.push("/user/safety") },
    { label: "Donate", sub: "Support city campaigns", icon: HandHeart, tone: "success", go: () => router.push("/user/donations") },
    { label: "Play Tidy Town", sub: "A quick recycling game", icon: Gamepad2, tone: "info", go: () => router.push("/user/game") },
  ];

  const latest = ctx.notices.slice(0, 3);
  const busy = [
    ...ctx.openComplaints.slice(0, 2).map((c) => ({ id: c.id, title: c.subject, sub: `${STATUS[c.status].label} · ${timeAgo(c.messages[c.messages.length - 1]?.at ?? c.createdAt)}`, tone: STATUS[c.status].tone, dot: !!c.userUnread, go: () => router.push({ pathname: "/user/complaint/[id]", params: { id: c.id } }) })),
    ...ctx.myReports.filter((r) => r.status === "open").slice(0, 2).map((r) => ({ id: r.id, title: r.subject, sub: `Neighbor report · ${timeAgo(r.messages[r.messages.length - 1]?.at ?? r.createdAt)}`, tone: "primary" as Tone, dot: !!r.unread, go: () => router.push({ pathname: "/user/report/[id]", params: { id: r.id } }) })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView key={rk} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_SPACE + 24 }}>
        <LinearGradient colors={t.hero} style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 54, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
          <Reveal>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <AvatarMenu profile="/user/me"><Avatar who={me} size={50} ring={t.gold} /></AvatarMenu>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.medium, fontSize: 13.5, opacity: 0.75 }} color="#fff">{greeting()},</Text>
                <Text style={{ fontFamily: font.heavy, fontSize: 24 }} color="#fff">{firstName(me.name)}</Text>
              </View>
              <Tap onPress={() => router.push("/user/notifications")} accessibilityLabel="Notifications" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
                <Bell size={20} color="#fff" />
                {ctx.unseenAnnouncements > 0 && <View style={{ position: "absolute", top: 8, right: 9, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: t.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }}><Text style={{ fontFamily: font.heavy, fontSize: 9.5 }} color="#1B2433">{ctx.unseenAnnouncements}</Text></View>}
              </Tap>
            </View>
          </Reveal>
          {place && (
            <Reveal i={1}>
              <View style={{ marginTop: 22, padding: 16, borderRadius: radius.lg, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" }}>
                <Text style={{ fontFamily: font.bold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", opacity: 0.7 }} color={t.gold}>You live at</Text>
                <Text style={{ fontFamily: font.heavy, fontSize: 20, marginTop: 4 }} color="#fff">{place.name}</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 13, opacity: 0.8, marginTop: 3 }} color="#fff">{me.unit ? `Unit ${me.unit} · ` : ""}{place.district}</Text>
              </View>
            </Reveal>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -26 }}>
          <Reveal i={2}>
            <Card pad={0} style={{ flexDirection: "row" }}>
              {[
                { n: ctx.unseen, label: "New notices", go: () => router.navigate("/user/community") },
                { n: ctx.openComplaints.length, label: "Open requests", go: () => router.navigate("/user/help") },
                { n: ctx.myReports.filter((r) => r.status === "open").length, label: "Chats", go: () => router.navigate({ pathname: "/user/help", params: { tab: "reports" } }) },
              ].map((s, i) => (
                <Tap key={s.label} onPress={s.go} style={{ flex: 1, alignItems: "center", paddingVertical: 16, borderLeftWidth: i ? 1 : 0, borderLeftColor: t.border }}>
                  <Text v="num" style={{ fontSize: 26, lineHeight: 30 }}>{s.n}</Text>
                  <Text style={{ fontFamily: font.semibold, fontSize: 12 }} color="sub">{s.label}</Text>
                </Tap>
              ))}
            </Card>
          </Reveal>

          <View style={{ marginTop: 26 }}>
            <SectionTitle title="What would you like to do?" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {actions.map((a, i) => {
                const c = toneColors(t, isDark, a.tone);
                return (
                  <Reveal i={i + 3} key={a.label} style={{ width: "48%", flexGrow: 1 }}>
                    <Tap onPress={a.go} scale={0.97}>
                      <View style={{ borderRadius: radius.lg, padding: 14, backgroundColor: c.bg, minHeight: 112, justifyContent: "space-between" }}>
                        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center" }}>
                          <a.icon size={20} color={c.fg} strokeWidth={2.3} />
                        </View>
                        <View>
                          <Text style={{ fontFamily: font.heavy, fontSize: 15, marginTop: 10 }} color={c.fg}>{a.label}</Text>
                          <Text style={{ fontFamily: font.medium, fontSize: 12, marginTop: 1 }} color={c.fg} numberOfLines={1}>{a.sub}</Text>
                        </View>
                      </View>
                    </Tap>
                  </Reveal>
                );
              })}
            </View>
          </View>

          {busy.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <SectionTitle title="Following up" action="See all" onAction={() => router.navigate("/user/help")} />
              <Card pad={6}>
                {busy.map((b, i) => {
                  const c = toneColors(t, isDark, b.tone);
                  return (
                    <Tap key={b.id} onPress={b.go} scale={0.985} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 11, borderTopWidth: i ? 1 : 0, borderTopColor: t.border }}>
                      <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: c.fg }} />
                      <View style={{ flex: 1 }}>
                        <Text v="small" numberOfLines={1} style={{ fontFamily: font.bold }}>{b.title}</Text>
                        <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="sub">{b.sub}</Text>
                      </View>
                      {b.dot && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.primary }} />}
                    </Tap>
                  );
                })}
              </Card>
            </View>
          )}

          <View style={{ marginTop: 28 }}>
            <SectionTitle title="Latest notices" action="All notices" onAction={() => router.navigate("/user/community")} />
            <View style={{ gap: 12 }}>
              {latest.map((n, i) => (
                <Reveal i={i} key={n.id}>
                  <NoticeCard notice={n} kind={sourceKind(n, me.placeId)} source={ctx.sourceOf(n)} unread={!ctx.isSeen(n)} onPress={() => { markSeen(n.id); setOpen(n); }} />
                </Reveal>
              ))}
              {latest.length === 0 && (
                <Card style={{ alignItems: "center", gap: 8 }}>
                  <Newspaper size={26} color={t.mute} />
                  <Text v="small" color="sub">No notices yet.</Text>
                </Card>
              )}
            </View>
          </View>
          <View style={{ marginTop: 18, alignItems: "center" }}><Badge label="Royal Organizing Ecosystem" tone="neutral" /></View>
        </View>
      </ScrollView>
      <NoticeSheet notice={open} kind={open ? sourceKind(open, me.placeId) : "city"} source={open ? ctx.sourceOf(open) : ""} onClose={() => setOpen(null)} />
    </View>
  );
}
