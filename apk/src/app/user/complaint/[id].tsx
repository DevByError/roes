import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check, CheckCircle2, Clock3, Send } from "lucide-react-native";
import { PRIORITY, STATUS, priorityColor } from "@/lib/complaintmeta";
import { clock, longDate } from "@/lib/format";
import { KIND } from "@/lib/helpmeta";
import { useApp } from "@/lib/store";
import { font, useTheme } from "@/lib/theme";
import type { ComplaintStatus } from "@/lib/types";
import { Avatar } from "@/ui/Avatar";
import { Badge, EmptyState } from "@/ui/Misc";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { buzz } from "@/ui/haptics";

const STEPS: { k: ComplaintStatus; label: string }[] = [
  { k: "new", label: "Sent" },
  { k: "in_review", label: "In review" },
  { k: "resolved", label: "Resolved" },
];

export default function UserComplaint() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const c = useApp((s) => s.complaints.find((x) => x.id === id));
  const places = useApp((s) => s.places);
  const reply = useApp((s) => s.userReply);
  const markRead = useApp((s) => s.markUserRead);
  const [text, setText] = useState("");
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, c?.userUnread, markRead]);
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
  const place = places.find((p) => p.id === c.placeId);
  const k = KIND[c.kind];
  const s = STATUS[c.status];
  const p = PRIORITY[c.priority];
  const dest = c.kind === "public" ? "City Hall" : place?.name ?? "Your admin";
  const stage = STEPS.findIndex((x) => x.k === c.status);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    buzz("light");
    reply(c.id, body);
    setText("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 14, paddingBottom: 14, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Tap onPress={() => (router.canGoBack() ? router.back() : router.replace("/user/help"))} accessibilityLabel="Back" style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color={t.text} />
          </Tap>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub">Sent to</Text>
            <Text v="sub" numberOfLines={1}>{dest}</Text>
          </View>
          <Badge label={k.label} tone={k.tone} icon={k.icon} />
        </View>
        <Text style={{ fontFamily: font.heavy, fontSize: 18, lineHeight: 24, marginTop: 14 }}>{c.subject}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: priorityColor(t, c.priority) }} />
            <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="sub">{p.label} priority</Text>
          </View>
          <Text color="mute">·</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 12.5, textTransform: "capitalize" }} color="sub">{c.category}</Text>
          <Text color="mute">·</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 12.5 }} color="sub">{longDate(c.createdAt)}</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={{ position: "absolute", left: "16.6%", right: "16.6%", top: 11, height: 3, borderRadius: 2, backgroundColor: t.surface2 }}>
            <View style={{ width: `${Math.max(0, stage) * 50}%`, height: 3, borderRadius: 2, backgroundColor: c.status === "resolved" ? t.success : t.primary }} />
          </View>
          <View style={{ flexDirection: "row" }}>
            {STEPS.map((st, i) => {
              const done = i <= stage;
              return (
                <View key={st.k} style={{ flex: 1, alignItems: "center" }}>
                  <View style={{ width: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: done ? (c.status === "resolved" ? t.success : t.primary) : t.surface2, borderWidth: 3, borderColor: t.surface }}>
                    {done ? <Check size={12} color={t.onPrimary} strokeWidth={3.5} /> : <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.mute }} />}
                  </View>
                  <Text style={{ fontFamily: font.bold, fontSize: 11.5, marginTop: 5 }} color={done ? "text" : "mute"}>{st.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView ref={scroller} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {c.messages.map((m, i) => {
          const mine = m.from === "user";
          return (
            <Animated.View key={m.id} entering={FadeInDown.delay(Math.min(i, 6) * 50).springify().damping(18)} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "84%", flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
              {!mine && (
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: font.heavy, fontSize: 11 }} color="onPrimary">A</Text>
                </View>
              )}
              <View style={{ flexShrink: 1 }}>
                <View style={{ backgroundColor: mine ? t.primary : t.surface, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: mine ? 6 : 20, borderBottomLeftRadius: mine ? 20 : 6, borderWidth: mine ? 0 : 1, borderColor: t.border }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 15, lineHeight: 21, flexShrink: 1 }} color={mine ? "onPrimary" : "text"}>{m.text}</Text>
                </View>
                <Text style={{ fontFamily: font.medium, fontSize: 11, marginTop: 4, alignSelf: mine ? "flex-end" : "flex-start" }} color="mute">{!mine ? "Admin · " : ""}{clock(m.at)}</Text>
              </View>
            </Animated.View>
          );
        })}
        {c.status === "resolved" ? (
          <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6, paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: t.successSoft }}>
            <CheckCircle2 size={15} color={t.success} />
            <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color="successInk">Resolved. Reply to reopen it.</Text>
          </View>
        ) : c.messages.length === 1 ? (
          <Text style={{ textAlign: "center", fontFamily: font.medium, fontSize: 12.5, marginTop: 8 }} color="mute">Waiting for {dest} to reply. You'll see a dot on Help when they do.</Text>
        ) : null}
      </ScrollView>

      <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add more details…"
            placeholderTextColor={t.mute}
            multiline
            style={[{ flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, backgroundColor: t.surface2, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontFamily: font.medium, fontSize: 15, color: t.text }, Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null]}
          />
          <Tap onPress={send} haptic="none" accessibilityLabel="Send message" style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: text.trim() ? t.primary : t.surface2 }}>
            <Send size={19} color={text.trim() ? t.onPrimary : t.mute} />
          </Tap>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
