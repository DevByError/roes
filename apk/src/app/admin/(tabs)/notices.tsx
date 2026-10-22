import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Globe, Lock, Megaphone, Pin, PinOff, Plus, Trash2 } from "lucide-react-native";
import { useAdminCtx } from "@/features/admin/data";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { shortDate, timeAgo } from "@/lib/format";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Notice } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Confirm } from "@/ui/Confirm";
import { Fab } from "@/ui/Fab";
import { Field } from "@/ui/Field";
import { Badge, EmptyState, Reveal, ScreenHeader, Toggle } from "@/ui/Misc";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { useScrollReset } from "@/lib/useScrollReset";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Notices() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const { notices, residential, residents, place } = useAdminCtx();
  const { compose } = useLocalSearchParams<{ compose?: string }>();
  const [editing, setEditing] = useState<Notice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (compose) {
      setEditing(null);
      setOpen(true);
      router.setParams({ compose: undefined });
    }
  }, [compose]);

  const audience = residential ? `Private · only the ${residents.length} residents of ${place?.name} see these` : "Public · everyone using ROES can see these";

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList key={rk}
        data={notices}
        keyExtractor={(n) => n.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_SPACE + 90, gap: 12 }}
        ListHeaderComponent={
          <View style={{ marginHorizontal: -20 }}>
            <ScreenHeader eyebrow="Announcements" title="Notices" subtitle={`${notices.length} published`} />
            <View style={{ marginHorizontal: 20, marginBottom: 16, flexDirection: "row", gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: residential ? t.primarySoft : t.infoSoft, alignItems: "center" }}>
              {residential ? <Lock size={17} color={t.primaryInk} /> : <Globe size={17} color={t.info} />}
              <Text v="small" style={{ flex: 1, fontFamily: font.semibold, lineHeight: 18 }} color={residential ? "primaryInk" : "info"}>{audience}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon={Megaphone} title="No notices yet" text="Share maintenance work, meetings or reminders with your community." action={<Button label="Write the first notice" size="md" onPress={() => { setEditing(null); setOpen(true); }} icon={Plus} />} />}
        renderItem={({ item, index }) => (
          <Reveal i={index}>
            <Tap onPress={() => { setEditing(item); setOpen(true); }} scale={0.985}>
              <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: item.pinned ? t.gold + "88" : t.border, overflow: "hidden", shadowColor: t.shadow, shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 }}>
                {item.pinned && <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: t.gold }} />}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Badge label={item.audience === "private" ? "Residents" : "Public"} tone={item.audience === "private" ? "primary" : "info"} icon={item.audience === "private" ? Lock : Globe} />
                  {item.pinned && <Badge label="Pinned" tone="gold" icon={Pin} />}
                  <View style={{ flex: 1 }} />
                  <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="mute">{timeAgo(item.createdAt)}</Text>
                </View>
                <Text v="sub" style={{ lineHeight: 22 }}>{item.title}</Text>
                <Text v="small" color="sub" numberOfLines={3} style={{ marginTop: 6, lineHeight: 20 }}>{item.body}</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 11.5, marginTop: 12 }} color="mute">Posted {shortDate(item.createdAt)}</Text>
              </View>
            </Tap>
          </Reveal>
        )}
      />
      <Fab label="New notice" icon={Plus} onPress={() => { setEditing(null); setOpen(true); }} />
      <NoticeSheet key={editing?.id ?? "new"} notice={editing} visible={open} onClose={() => setOpen(false)} residential={residential} audienceCount={residents.length} />
    </View>
  );
}

function NoticeSheet({ notice, visible, onClose, residential, audienceCount }: { notice: Notice | null; visible: boolean; onClose: () => void; residential: boolean; audienceCount: number }) {
  const { t } = useTheme();
  const add = useApp((s) => s.addNotice);
  const update = useApp((s) => s.updateNotice);
  const remove = useApp((s) => s.removeNotice);
  const [title, setTitle] = useState(notice?.title ?? "");
  const [body, setBody] = useState(notice?.body ?? "");
  const [pinned, setPinned] = useState(notice?.pinned ?? false);
  const [err, setErr] = useState<{ title?: string; body?: string }>({});
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(notice?.title ?? "");
      setBody(notice?.body ?? "");
      setPinned(notice?.pinned ?? false);
      setErr({});
    }
  }, [visible, notice]);

  const save = async () => {
    const e: typeof err = {};
    if (title.trim().length < 4) e.title = "Give the notice a clear title";
    if (body.trim().length < 12) e.body = "Add a few more details (12+ characters)";
    setErr(e);
    if (e.title || e.body) return setShake((n) => n + 1);
    setBusy(true);
    await wait(650);
    if (notice) {
      update(notice.id, { title: title.trim(), body: body.trim(), pinned });
      toast("Notice updated");
    } else {
      add({ title, body, pinned });
      toast(residential ? `Sent to ${audienceCount} residents` : "Published for everyone");
    }
    setBusy(false);
    onClose();
  };

  return (
    <>
      <Sheet
        visible={visible}
        onClose={onClose}
        title={notice ? "Edit notice" : "New notice"}
        subtitle={residential ? "Visible only to your residents" : "Visible to everyone"}
        footer={
          <View style={{ flexDirection: "row", gap: 10 }}>
            {notice && <Button label="" icon={Trash2} variant="danger" onPress={() => setConfirm(true)} style={{ width: 56, paddingHorizontal: 0 }} />}
            <View style={{ flex: 1 }}><Button label={notice ? "Save changes" : "Publish notice"} onPress={save} loading={busy} /></View>
          </View>
        }
      >
        <View style={{ gap: 14, paddingBottom: 6 }}>
          <Field label="Title" value={title} onChangeText={(v) => { setTitle(v); setErr((x) => ({ ...x, title: undefined })); }} error={err.title} shakeKey={err.title ? shake : 0} maxLength={80} autoCapitalize="sentences" />
          <View>
            <Field label="Message" value={body} onChangeText={(v) => { setBody(v); setErr((x) => ({ ...x, body: undefined })); }} error={err.body} shakeKey={err.body ? shake : 0} multiline maxLength={500} autoCapitalize="sentences" />
            <Text style={{ fontFamily: font.medium, fontSize: 11.5, alignSelf: "flex-end", marginTop: 6, fontVariant: ["tabular-nums"] }} color="mute">{body.length}/500</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: t.surface2 }}>
            {pinned ? <Pin size={20} color={t.goldInk} /> : <PinOff size={20} color={t.mute} />}
            <View style={{ flex: 1 }}>
              <Text v="small" style={{ fontFamily: font.bold }}>Pin to top</Text>
              <Text style={{ fontFamily: font.medium, fontSize: 12 }} color="sub">Keeps it above newer notices</Text>
            </View>
            <Toggle on={pinned} onChange={setPinned} />
          </View>
        </View>
      </Sheet>
      <Confirm
        visible={confirm}
        title="Delete this notice?"
        text="It will disappear for everyone. This can't be undone."
        confirm="Delete notice"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          if (notice) remove(notice.id);
          setConfirm(false);
          onClose();
          toast("Notice deleted", "info");
        }}
      />
    </>
  );
}
