import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Plus, ScrollText, Trash2 } from "lucide-react-native";
import { useAdminCtx } from "@/features/admin/data";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { timeAgo } from "@/lib/format";
import { RULE_CATEGORIES, RULE_META } from "@/lib/rulemeta";
import { useApp } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import type { Rule, RuleCategory } from "@/lib/types";
import { Button } from "@/ui/Button";
import { Confirm } from "@/ui/Confirm";
import { Fab } from "@/ui/Fab";
import { Field } from "@/ui/Field";
import { Card, EmptyState, Reveal, ScreenHeader, toneColors } from "@/ui/Misc";
import { Segmented } from "@/ui/Segmented";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { useScrollReset } from "@/lib/useScrollReset";

type Type = "residents" | "visitors";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Rules() {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const { place, residential } = useAdminCtx();
  const moveRule = useApp((s) => s.moveRule);
  const { add } = useLocalSearchParams<{ add?: string }>();
  const [type, setType] = useState<Type>(residential ? "residents" : "visitors");
  const [reorder, setReorder] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (add) {
      setEditing(null);
      setOpen(true);
      router.setParams({ add: undefined });
    }
  }, [add]);

  if (!place) return null;
  const list = place.rules[type];
  const audience = type === "residents" ? "residents" : "visitors";

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView key={rk} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_SPACE + 90 }}>
        <ScreenHeader
          eyebrow={place.name}
          title="House rules"
          subtitle={residential ? "Two sets: one for residents, one for visitors" : "One set of rules for everyone who visits"}
          right={
            list.length > 1 ? (
              <Tap onPress={() => setReorder((r) => !r)} accessibilityLabel={reorder ? "Done reordering" : "Reorder rules"} style={{ height: 42, paddingHorizontal: 14, borderRadius: 21, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: reorder ? t.primary : t.surface, borderWidth: 1, borderColor: reorder ? t.primary : t.border }}>
                {reorder ? <Check size={17} color={t.onPrimary} strokeWidth={3} /> : <ArrowUpDown size={17} color={t.sub} />}
                <Text v="small" style={{ fontFamily: font.bold }} color={reorder ? "onPrimary" : "sub"}>{reorder ? "Done" : "Reorder"}</Text>
              </Tap>
            ) : undefined
          }
        />
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {residential && (
            <Segmented value={type} onChange={(v) => { setType(v); setReorder(false); }} options={[{ value: "residents", label: "Resident rules", count: place.rules.residents.length }, { value: "visitors", label: "Visitor rules", count: place.rules.visitors.length }]} />
          )}

          <View style={{ flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: t.goldSoft, alignItems: "center" }}>
            <ScrollText size={19} color={t.goldInk} />
            <Text v="small" color="goldInk" style={{ flex: 1, fontFamily: font.semibold, lineHeight: 18 }}>
              {type === "residents" ? "Residents read these in their app and agree to them when they join." : "Shown to visitors at the gate and on the place's public page."}
            </Text>
          </View>

          {list.length === 0 ? (
            <EmptyState icon={ScrollText} title={`No ${audience} rules yet`} text="Clear rules prevent most complaints. Start with the essentials." action={<Button label="Add a rule" size="md" icon={Plus} onPress={() => { setEditing(null); setOpen(true); }} />} />
          ) : (
            <View style={{ gap: 10 }}>
              {list.map((r, i) => {
                const m = RULE_META[r.category];
                const c = toneColors(t, isDark, m.tone);
                return (
                  <Reveal i={i} key={r.id}>
                    <RuleWrap reorder={reorder} onPress={() => { setEditing(r); setOpen(true); }}>
                      <Card pad={14} style={{ flexDirection: "row", gap: 13 }}>
                        <View style={{ alignItems: "center", gap: 8 }}>
                          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                            <m.icon size={21} color={c.fg} strokeWidth={2.2} />
                          </View>
                          <Text style={{ fontFamily: font.heavy, fontSize: 12, fontVariant: ["tabular-nums"] }} color="mute">{String(i + 1).padStart(2, "0")}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text v="sub">{r.title}</Text>
                          <Text v="small" color="sub" style={{ marginTop: 4, lineHeight: 19 }}>{r.text}</Text>
                          <Text style={{ fontFamily: font.medium, fontSize: 11.5, marginTop: 8 }} color="mute">{m.label} · updated {timeAgo(r.updatedAt)}</Text>
                        </View>
                        {reorder && (
                          <View style={{ justifyContent: "center", gap: 8 }}>
                            <Tap haptic="select" onPress={() => moveRule(type, r.id, -1)} disabled={i === 0} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center", opacity: i === 0 ? 0.35 : 1 }} accessibilityLabel="Move up"><ArrowUp size={18} color={t.text} /></Tap>
                            <Tap haptic="select" onPress={() => moveRule(type, r.id, 1)} disabled={i === list.length - 1} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center", opacity: i === list.length - 1 ? 0.35 : 1 }} accessibilityLabel="Move down"><ArrowDown size={18} color={t.text} /></Tap>
                          </View>
                        )}
                      </Card>
                    </RuleWrap>
                  </Reveal>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      {!reorder && <Fab label="Add rule" icon={Plus} onPress={() => { setEditing(null); setOpen(true); }} />}
      <RuleSheet key={editing?.id ?? `new-${type}`} type={type} rule={editing} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

function RuleWrap({ reorder, onPress, children }: { reorder: boolean; onPress: () => void; children: React.ReactNode }) {
  if (reorder) return <View>{children}</View>;
  return <Tap onPress={onPress} scale={0.985}>{children}</Tap>;
}

function RuleSheet({ type, rule, visible, onClose }: { type: Type; rule: Rule | null; visible: boolean; onClose: () => void }) {
  const { t, isDark } = useTheme();
  const addRule = useApp((s) => s.addRule);
  const updateRule = useApp((s) => s.updateRule);
  const removeRule = useApp((s) => s.removeRule);
  const [cat, setCat] = useState<RuleCategory>(rule?.category ?? "general");
  const [title, setTitle] = useState(rule?.title ?? "");
  const [text, setText] = useState(rule?.text ?? "");
  const [err, setErr] = useState<{ title?: string; text?: string }>({});
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const strip = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      const k = RULE_CATEGORIES.indexOf(rule?.category ?? "general");
      const h = setTimeout(() => strip.current?.scrollTo({ x: Math.max(0, k * 104 - 60), animated: true }), 350);
      setCat(rule?.category ?? "general");
      setTitle(rule?.title ?? "");
      setText(rule?.text ?? "");
      setErr({});
      return () => clearTimeout(h);
    }
  }, [visible, rule]);

  const save = async () => {
    const e: typeof err = {};
    if (title.trim().length < 3) e.title = "Name the rule";
    if (text.trim().length < 10) e.text = "Explain the rule in a sentence or two";
    setErr(e);
    if (e.title || e.text) return setShake((n) => n + 1);
    setBusy(true);
    await wait(550);
    if (rule) updateRule(type, rule.id, { title: title.trim(), text: text.trim(), category: cat });
    else addRule(type, { title, text, category: cat });
    setBusy(false);
    toast(rule ? "Rule updated" : "Rule added");
    onClose();
  };

  return (
    <>
      <Sheet
        visible={visible}
        onClose={onClose}
        title={rule ? "Edit rule" : "New rule"}
        subtitle={type === "residents" ? "For residents" : "For visitors"}
        footer={
          <View style={{ flexDirection: "row", gap: 10 }}>
            {rule && <Button label="" icon={Trash2} variant="danger" onPress={() => setConfirm(true)} style={{ width: 56, paddingHorizontal: 0 }} />}
            <View style={{ flex: 1 }}><Button label={rule ? "Save changes" : "Add rule"} onPress={save} loading={busy} /></View>
          </View>
        }
      >
        <View style={{ gap: 16, paddingBottom: 6 }}>
          <View>
            <Text v="small" color="sub" style={{ fontFamily: font.semibold, marginBottom: 10 }}>Topic</Text>
            <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -22 }}>
              <View style={{ width: 14 }} />
              {RULE_CATEGORIES.map((k) => {
                const m = RULE_META[k];
                const on = k === cat;
                const c = toneColors(t, isDark, m.tone);
                return (
                  <Tap key={k} haptic="select" onPress={() => setCat(k)} style={{ flexDirection: "row", alignItems: "center", gap: 7, height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: on ? c.bg : t.surface, borderWidth: 1.5, borderColor: on ? c.fg : t.border }}>
                    <m.icon size={17} color={on ? c.fg : t.mute} strokeWidth={2.3} />
                    <Text v="small" style={{ fontFamily: font.bold }} color={on ? c.fg : "sub"}>{m.label}</Text>
                  </Tap>
                );
              })}
              <View style={{ width: 14 }} />
            </ScrollView>
          </View>
          <Field label="Rule name" value={title} onChangeText={(v) => { setTitle(v); setErr((x) => ({ ...x, title: undefined })); }} error={err.title} shakeKey={err.title ? shake : 0} maxLength={40} autoCapitalize="sentences" />
          <View>
            <Field label="What should people do?" value={text} onChangeText={(v) => { setText(v); setErr((x) => ({ ...x, text: undefined })); }} error={err.text} shakeKey={err.text ? shake : 0} multiline maxLength={240} autoCapitalize="sentences" />
            <Text style={{ fontFamily: font.medium, fontSize: 11.5, alignSelf: "flex-end", marginTop: 6, fontVariant: ["tabular-nums"] }} color="mute">{text.length}/240</Text>
          </View>
        </View>
      </Sheet>
      <Confirm visible={confirm} title="Delete this rule?" text="Residents and visitors will no longer see it." confirm="Delete rule" onClose={() => setConfirm(false)} onConfirm={() => { if (rule) removeRule(type, rule.id); setConfirm(false); onClose(); toast("Rule deleted", "info"); }} />
    </>
  );
}
