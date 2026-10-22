import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, Clock3, Send, Sparkles } from "lucide-react-native";
import { clock, longDate } from "@/lib/format";
import { PRIORITY, STATUS, priorityColor } from "@/lib/complaintmeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { ComplaintStatus } from "@/lib/types";
import { Avatar } from "@/ui/Avatar";
import { Badge, EmptyState, toneColors } from "@/ui/Misc";
import { buzz } from "@/ui/haptics";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";

const QUICK = [
  { label: "Looking into it", text: "Thanks for letting us know — we're looking into it." },
  { label: "Technician visiting", text: "A technician will visit tomorrow morning." },
  { label: "All fixed", text: "This has been fixed. Please let us know if it happens again." },
];
const STEPS: ComplaintStatus[] = ["new", "in_review", "resolved"];

export default function ComplaintScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const c = useApp((s) => s.complaints.find((x) => x.id === id));
  const who = useApp((s) => s.accounts.find((a) => a.id === c?.fromId));
  const reply = useApp((s) => s.replyComplaint);
  const setStatus = useApp((s) => s.setComplaintStatus);
  const markRead = useApp((s) => s.markRead);
  const [text, setText] = useState("");
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);
  useEffect(() => {
    const h = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(h);
  }, [c?.messages.length]);

  if (!c) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: "center", padding: 24 }}>
        <EmptyState icon={Clock3} title="Complaint not found" text="It may have been removed." />
      </View>
    );
  }

  const send = (msg?: string) => {
    const body = (msg ?? text).trim();
    if (!body) return;
    buzz("light");
    reply(c.id, body);
    setText("");
    if (c.status === "new") setStatus(c.id, "in_review");
  };
  const s = STATUS[c.status];
  const p = PRIORITY[c.priority];
  const resolved = c.status === "resolved";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 14, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace("/admin/inbox"))} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color={t.text} />
          </Tap>
          <Avatar who={who} name={who?.name} size={42} />
          <View style={{ flex: 1 }}>
            <Text v="sub" numberOfLines={1}>{who?.name ?? "Resident"}</Text>
            <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{who?.unit ? `Unit ${who.unit} · ` : ""}{longDate(c.createdAt)}</Text>
          </View>
          <Badge label={s.label} tone={s.tone} dot />
        </View>
        <Text style={{ fontFamily: font.heavy, fontSize: 18, lineHeight: 24, marginTop: 14 }}>{c.subject}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: priorityColor(t, c.priority) }} />
            <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="sub">{p.label} priority</Text>
          </View>
          <Text color="mute">·</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 12.5, textTransform: "capitalize" }} color="sub">{c.category}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginTop: 14, backgroundColor: t.surface2, borderRadius: 14, padding: 4 }}>
          {STEPS.map((k) => {
            const on = c.status === k;
            const col = toneColors(t, isDark, STATUS[k].tone);
            return (
              <Tap key={k} haptic="select" scale={0.97} onPress={() => { setStatus(c.id, k); toast(k === "resolved" ? "Marked as resolved" : `Moved to ${STATUS[k].label.toLowerCase()}`, k === "resolved" ? "success" : "info"); }} style={{ flex: 1, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, backgroundColor: on ? col.bg : "transparent", borderWidth: on ? 1 : 0, borderColor: on ? col.fg + "55" : "transparent" }}>
                {k === "resolved" && <CheckCircle2 size={14} color={on ? col.fg : t.mute} />}
                <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color={on ? col.fg : "sub"}>{STATUS[k].label}</Text>
              </Tap>
            );
          })}
        </View>
      </View>

      <ScrollView ref={scroller} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {c.messages.map((m, i) => {
          const mine = m.from === "admin";
          return (
            <Animated.View key={m.id} entering={FadeInDown.delay(Math.min(i, 6) * 50).springify().damping(18)} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "84%", flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
              {!mine && <Avatar who={who} name={who?.name} size={28} />}
              <View style={{ flexShrink: 1 }}>
                <View style={{ backgroundColor: mine ? t.primary : t.surface, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: mine ? 6 : 20, borderBottomLeftRadius: mine ? 20 : 6, borderWidth: mine ? 0 : 1, borderColor: t.border }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21, flexShrink: 1 }} color={mine ? "onPrimary" : "text"}>{m.text}</Text>
                </View>
                <Text style={{ fontFamily: font.medium, fontSize: 11, marginTop: 4, alignSelf: mine ? "flex-end" : "flex-start" }} color="mute">{clock(m.at)}</Text>
              </View>
            </Animated.View>
          );
        })}
        {resolved && (
          <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6, paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: t.successSoft }}>
            <CheckCircle2 size={15} color={t.success} />
            <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color="successInk">Marked as resolved</Text>
          </View>
        )}
      </ScrollView>

      <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 10 }}>
        {!resolved && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingBottom: 10 }} keyboardShouldPersistTaps="handled">
            {QUICK.map((q) => (
              <Tap key={q.label} haptic="select" onPress={() => send(q.text)} accessibilityLabel={q.text} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 34, paddingHorizontal: 13, borderRadius: 17, backgroundColor: t.primarySoft }}>
                <Sparkles size={13} color={t.primaryInk} />
                <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="primaryInk">{q.label}</Text>
              </Tap>
            ))}
          </ScrollView>
        )}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={resolved ? "Reply to reopen the conversation…" : "Write a reply…"}
            placeholderTextColor={t.mute}
            multiline
            style={[{ flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, backgroundColor: t.surface2, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontFamily: font.medium, fontSize: 15, color: t.text }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]}
          />
          <Tap onPress={() => send()} haptic="none" accessibilityLabel="Send reply" style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: text.trim() ? t.primary : t.surface2 }}>
            <Send size={19} color={text.trim() ? t.onPrimary : t.mute} />
          </Tap>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
