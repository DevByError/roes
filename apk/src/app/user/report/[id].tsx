import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Ban, CheckCircle2, Clock3, Handshake, Send, ShieldCheck, Sparkles, Users } from "lucide-react-native";
import { clock, firstName } from "@/lib/format";
import { RULE_META } from "@/lib/rulemeta";
import { useApp, useMe } from "@/lib/store";
import { font, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Badge, EmptyState } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { Confirm } from "@/ui/Confirm";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { buzz } from "@/ui/haptics";

function Dot({ i }: { i: number }) {
  const { t } = useTheme();
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withDelay(i * 160, withRepeat(withSequence(withTiming(1, { duration: 380, easing: Easing.inOut(Easing.quad) }), withTiming(0.3, { duration: 380 })), -1));
  }, [i, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.mute }, st]} />;
}

export default function ReportChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const me = useMe();
  const r = useApp((s) => s.reports.find((x) => x.id === id));
  const accounts = useApp((s) => s.accounts);
  const sendMsg = useApp((s) => s.sendReportMessage);
  const resolveReport = useApp((s) => s.resolveReport);
  const escalateReport = useApp((s) => s.escalateReport);
  const markRead = useApp((s) => s.markReportRead);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sendAdmin, setSendAdmin] = useState(false);
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, r?.messages.length, r?.unread, markRead]);
  useEffect(() => {
    const h = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(h);
  }, [r?.messages.length, typing]);

  if (!r || !me) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: "center", padding: 24 }}>
        <EmptyState icon={Clock3} title="Chat not found" text="It may have been removed." />
      </View>
    );
  }
  const group = r.againstId === "all";
  const crowd = accounts.filter((a) => a.role === "user" && a.placeId === r.placeId && a.id !== me.id);
  const otherId = r.fromId === me.id ? r.againstId : r.fromId;
  const other = group ? crowd[0] : accounts.find((a) => a.id === otherId);
  const starter = r.fromId === me.id;
  const nextVoice = other;
  const open = r.status === "open";
  const meta = RULE_META[r.category];
  const nameOf = (from: string) => (from === me.id ? "You" : from === "mod" ? "ROES Mediator" : accounts.find((a) => a.id === from)?.name ?? "Neighbor");

  const escalate = async () => {
    await escalateReport(r.id);
    buzz("success");
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !open || typing) return;
    setText("");
    setTyping(true);
    const res = await sendMsg(r.id, body);
    setTyping(false);
    buzz(res?.flagged ? "error" : "light");
  };

  const resolve = async () => {
    await resolveReport(r.id);
    buzz("success");
    toast("Marked as resolved", "success");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 12, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace("/user/help"))} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color={t.text} />
          </Tap>
          <View style={{ flexDirection: "row", width: group ? 90 : 64 }}>
            <Avatar who={me} size={38} ring />
            <View style={{ marginLeft: -12 }}><Avatar who={other} size={38} ring /></View>
            {group && crowd[1] ? <View style={{ marginLeft: -12 }}><Avatar who={crowd[1]} size={38} ring /></View> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text v="sub" numberOfLines={1}>{group ? "All neighbors" : other?.name ?? "Neighbor"}</Text>
            <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{group ? `${crowd.length + 1} people · AI mediator` : "With ROES Mediator · AI"}</Text>
          </View>
          <Badge label={open ? "In progress" : r.status === "resolved" ? "Resolved" : "With admin"} tone={open ? "primary" : r.status === "resolved" ? "success" : "warn"} dot />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Badge label={meta.label} tone={meta.tone} icon={meta.icon} />
          <Text style={{ fontFamily: font.bold, fontSize: 14, flex: 1 }} numberOfLines={1}>{r.subject}</Text>
        </View>
      </View>

      <ScrollView ref={scroller} contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {r.messages.map((m, i) => {
          const mine = m.from === me.id;
          const mod = m.from === "mod";
          const who = accounts.find((a) => a.id === m.from);
          if (mod) {
            return (
              <Animated.View key={m.id} entering={FadeInDown.delay(Math.min(i, 5) * 60).springify().damping(18)} style={{ alignSelf: "stretch" }}>
                <View style={{ borderRadius: 20, padding: 14, backgroundColor: t.callout, borderWidth: 1, borderColor: t.calloutBorder }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 7 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: t.gold, alignItems: "center", justifyContent: "center" }}>
                      <Sparkles size={13} color="#1B2433" strokeWidth={2.6} />
                    </View>
                    <Text style={{ fontFamily: font.heavy, fontSize: 12.5 }} color={t.calloutInk}>ROES Mediator · AI</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontFamily: font.medium, fontSize: 11 }} color="mute">{clock(m.at)}</Text>
                  </View>
                  <Text style={{ fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, flexShrink: 1 }}>{m.text}</Text>
                </View>
              </Animated.View>
            );
          }
          if (m.flagged) {
            return (
              <Animated.View key={m.id} entering={FadeInDown.springify().damping(18)} style={{ alignSelf: "flex-end", maxWidth: "84%" }}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: 6, borderWidth: 1.5, borderStyle: "dashed", borderColor: t.danger, backgroundColor: t.dangerSoft }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21, flexShrink: 1, textDecorationLine: "line-through", opacity: 0.7 }} color="danger">{m.text}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-end", marginTop: 4 }}>
                  <Ban size={12} color={t.danger} />
                  <Text style={{ fontFamily: font.bold, fontSize: 11 }} color="danger">Not sent · held by the mediator</Text>
                </View>
              </Animated.View>
            );
          }
          return (
            <Animated.View key={m.id} entering={FadeInDown.delay(Math.min(i, 5) * 60).springify().damping(18)} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "84%", flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
              {!mine && <Avatar who={who} size={28} />}
              <View style={{ flexShrink: 1 }}>
                {!mine && <Text style={{ fontFamily: font.bold, fontSize: 11.5, marginBottom: 3, marginLeft: 4 }} color="sub">{firstName(who?.name ?? "Neighbor")}</Text>}
                <View style={{ backgroundColor: mine ? t.primary : t.surface, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: mine ? 6 : 20, borderBottomLeftRadius: mine ? 20 : 6, borderWidth: mine ? 0 : 1, borderColor: t.border }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21, flexShrink: 1 }} color={mine ? "onPrimary" : "text"}>{m.text}</Text>
                </View>
                <Text style={{ fontFamily: font.medium, fontSize: 11, marginTop: 4, alignSelf: mine ? "flex-end" : "flex-start" }} color="mute">{clock(m.at)}</Text>
              </View>
            </Animated.View>
          );
        })}
        {typing && (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={{ alignSelf: "flex-start", flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Avatar who={nextVoice} size={28} />
            <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: 16, height: 38, alignItems: "center", borderRadius: 19, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
              <Dot i={0} /><Dot i={1} /><Dot i={2} />
            </View>
          </Animated.View>
        )}
        {!open && (
          <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6, paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: r.status === "resolved" ? t.successSoft : t.warnSoft }}>
            {r.status === "resolved" ? <CheckCircle2 size={15} color={t.success} /> : <Users size={15} color={t.warn} />}
            <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color={r.status === "resolved" ? "successInk" : "warnInk"}>{r.status === "resolved" ? "This chat is resolved" : "Handed over to your admin"}</Text>
          </View>
        )}
      </ScrollView>

      <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 10 }}>
        {open ? (
          <>
            {starter ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingBottom: 10 }} keyboardShouldPersistTaps="handled">
              {starter && <Tap haptic="select" onPress={resolve} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 34, paddingHorizontal: 13, borderRadius: 17, backgroundColor: t.successSoft }}>
                <Handshake size={14} color={t.success} />
                <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="successInk">Mark resolved</Text>
              </Tap>}
              {starter && <Tap haptic="select" onPress={() => setSendAdmin(true)} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 34, paddingHorizontal: 13, borderRadius: 17, backgroundColor: t.primarySoft }}>
                <ShieldCheck size={14} color={t.primaryInk} />
                <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="primaryInk">Send to admin</Text>
              </Tap>}
            </ScrollView>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Write calmly and kindly…"
                placeholderTextColor={t.mute}
                multiline
                style={[{ flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, backgroundColor: t.surface2, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontFamily: font.medium, fontSize: 15, color: t.text }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]}
              />
              <Tap onPress={send} haptic="none" accessibilityLabel="Send message" style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: text.trim() ? t.primary : t.surface2 }}>
                <Send size={19} color={text.trim() ? t.onPrimary : t.mute} />
              </Tap>
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 14 }}>
            <Button label="Back to Help" variant="soft" onPress={() => router.replace("/user/help")} />
          </View>
        )}
      </View>
      <Confirm visible={sendAdmin} title="Send this chat to your admin?" text="Your admin will read the whole conversation and reply under Help › Complaints. This chat will close." confirm="Send to admin" destructive={false} onClose={() => setSendAdmin(false)} onConfirm={() => { setSendAdmin(false); escalate(); toast("Sent to your admin", "success"); }} />
    </KeyboardAvoidingView>
  );
}
