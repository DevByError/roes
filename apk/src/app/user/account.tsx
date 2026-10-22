import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, Building2, KeyRound, Lock, Mail, Phone, Trash2, User } from "lucide-react-native";
import { PasswordStrength } from "@/features/auth/parts";
import { SubHeader } from "@/features/user/SubHeader";
import { isPhone, passwordScore } from "@/lib/format";
import { useApp, useMe } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Badge, Card, Divider, Row } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { Confirm } from "@/ui/Confirm";
import { Field } from "@/ui/Field";
import { Segmented } from "@/ui/Segmented";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { buzz } from "@/ui/haptics";

export default function Account() {
  const { t } = useTheme();
  const me = useMe();
  const place = useApp((s) => s.places.find((p) => p.id === me?.placeId));
  const update = useApp((s) => s.updateProfile);
  const changePw = useApp((s) => s.changePassword);
  const del = useApp((s) => s.deleteAccount);
  const [name, setName] = useState(me?.name ?? "");
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [gender, setGender] = useState<"Female" | "Male">(me?.gender ?? "Female");
  const [tried, setTried] = useState(false);
  const [shake, setShake] = useState(0);
  const [saving, setSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [pwErr, setPwErr] = useState<{ cur?: string; next?: string; again?: string }>({});
  const [pwBusy, setPwBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  if (!me) return null;
  const dirty = name.trim() !== me.name || phone.trim() !== me.phone || gender !== me.gender;
  const nameErr = tried && name.trim().length < 2 ? "Enter your full name" : null;
  const phoneErr = tried && !isPhone(phone) ? "Enter a valid phone number" : null;

  const save = () => {
    setTried(true);
    if (name.trim().length < 2 || !isPhone(phone)) {
      setShake((n) => n + 1);
      buzz("error");
      return;
    }
    setSaving(true);
    void update({ name, phone, gender }).then((ok) => {
      setSaving(false);
      if (!ok) return;
      setTried(false);
      buzz("success");
      toast("Account updated", "success");
    });
  };

  const closePw = () => {
    setPwOpen(false);
    setCur(""); setNext(""); setAgain(""); setPwErr({});
  };
  const submitPw = () => {
    const e: typeof pwErr = {};
    if (!cur) e.cur = "Enter your current password";
    if (next.length < 8 || passwordScore(next) < 3) e.next = "Use 8+ characters with upper & lower case and a number";
    if (again !== next) e.again = "Passwords don't match";
    setPwErr(e);
    if (Object.keys(e).length) { buzz("error"); setShake((n) => n + 1); return; }
    setPwBusy(true);
    void changePw(cur, next).then((ok) => {
      setPwBusy(false);
      if (!ok) { setPwErr({ cur: "That isn't your current password" }); buzz("error"); setShake((n) => n + 1); return; }
      buzz("success");
      closePw();
      toast("Password changed", "success");
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <SubHeader title="Manage account" subtitle="Your details and security" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, gap: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <Avatar who={{ name, photo: me.photo, gender }} size={92} ring={t.gold} />
          <Text style={{ fontFamily: font.medium, fontSize: 12.5, textAlign: "center" }} color="sub">Change your photo from the Me tab.</Text>
        </View>

        <View style={{ gap: 14 }}>
          <Text v="label" color="mute">About you</Text>
          <Field label="Full name" icon={User} value={name} onChangeText={setName} error={nameErr} shakeKey={shake} autoCapitalize="words" />
          <Field label="Phone" icon={Phone} value={phone} onChangeText={setPhone} error={phoneErr} shakeKey={shake} keyboardType="phone-pad" />
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13 }} color="sub">Illustrated avatar style</Text>
            <Segmented value={gender} onChange={setGender} options={[{ value: "Female", label: "Female" }, { value: "Male", label: "Male" }]} />
          </View>
          <Button label="Save changes" onPress={save} loading={saving} disabled={!dirty} />
        </View>

        <View style={{ gap: 8 }}>
          <Text v="label" color="mute">Locked details</Text>
          <Card pad={0} style={{ paddingHorizontal: 16 }}>
            <Row icon={Mail} label="Email" value={me.email} tone="info" right={<Badge label="Verified" tone="success" icon={BadgeCheck} />} />
            <Divider inset={52} />
            <Row icon={Building2} label="Residence" value={`${place?.name ?? "—"}${me.unit ? ` · Unit ${me.unit}` : ""}`} tone="primary" />
          </Card>
          <Text style={{ fontFamily: font.medium, fontSize: 12, marginLeft: 4, lineHeight: 17 }} color="mute">Your email and residence are checked by your admin. To change them, send a complaint to your residence admin.</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text v="label" color="mute">Security</Text>
          <Card pad={0} style={{ paddingHorizontal: 16 }}>
            <Row icon={KeyRound} label="Change password" value="Use a strong, unique password" tone="gold" onPress={() => setPwOpen(true)} />
          </Card>
        </View>

        <View style={{ gap: 8 }}>
          <Text v="label" color="mute">Danger zone</Text>
          <Tap onPress={() => setDelOpen(true)} accessibilityLabel="Delete my account">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: t.dangerSoft }}>
              <Trash2 size={20} color={t.danger} />
              <View style={{ flex: 1 }}>
                <Text v="sub" color="danger">Delete my account</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 12.5, marginTop: 2 }} color="danger">Removes your profile from this device and ROES.</Text>
              </View>
            </View>
          </Tap>
        </View>
      </ScrollView>

      <Sheet visible={pwOpen} onClose={closePw} title="Change password" subtitle="You'll stay signed in on this device" footer={<Button label="Update password" icon={Lock} onPress={submitPw} loading={pwBusy} />}>
        <View style={{ gap: 14, paddingBottom: 10 }}>
          <Field label="Current password" secure value={cur} onChangeText={setCur} error={pwErr.cur} shakeKey={shake} />
          <View>
            <Field label="New password" secure value={next} onChangeText={setNext} error={pwErr.next} shakeKey={shake} />
            <PasswordStrength password={next} />
          </View>
          <Field label="Confirm new password" secure value={again} onChangeText={setAgain} error={pwErr.again} shakeKey={shake} />
        </View>
      </Sheet>
      <Confirm visible={delOpen} title="Delete your account?" text="This permanently removes your profile and sign-in. You'd have to register again to come back." confirm="Delete account" onClose={() => setDelOpen(false)} onConfirm={() => { setDelOpen(false); del(); toast("Account deleted", "info"); router.replace("/login"); }} />
    </KeyboardAvoidingView>
  );
}
