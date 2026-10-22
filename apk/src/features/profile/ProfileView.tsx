import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Bell, Building2, Camera, Info, LogOut, Mail, Moon, Pencil, Phone, Smartphone, Trash2, Vibrate } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isEmail, isPhone, longDate, maskPhone } from "@/lib/format";
import { useApp, useMe } from "@/lib/store";
import { font, radius, useTheme } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Badge, Card, Divider, Reveal, Row, Toggle } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { Confirm } from "@/ui/Confirm";
import { Field } from "@/ui/Field";
import { Segmented } from "@/ui/Segmented";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { buzz } from "@/ui/haptics";
import { useScrollReset } from "@/lib/useScrollReset";

export function ProfileView({ bottomSpace = 30, extra }: { bottomSpace?: number; extra?: ReactNode }) {
  const rk = useScrollReset();
  const { t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const me = useMe();
  const place = useApp((s) => s.places.find((p) => p.id === me?.placeId));
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const setPhoto = useApp((s) => s.setPhoto);
  const logout = useApp((s) => s.logout);
  const [photoSheet, setPhotoSheet] = useState(false);
  const [out, setOut] = useState(false);
  const updateContact = useApp((s) => s.updateContact);
  const [editOpen, setEditOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errs, setErrs] = useState<{ email?: string; phone?: string }>({});
  const [shake, setShake] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!me) return null;
  const isAdmin = me.role === "admin";

  const openEdit = () => {
    setEmail(me.email);
    setPhone(me.phone);
    setErrs({});
    setEditOpen(true);
  };
  const saveContact = () => {
    const e: typeof errs = {};
    if (!isEmail(email)) e.email = "Enter a valid email address";
    if (!isPhone(phone)) e.phone = "Enter a valid phone number";
    setErrs(e);
    if (Object.keys(e).length) {
      buzz("error");
      setShake((n) => n + 1);
      return;
    }
    setSaving(true);
    void updateContact({ email, phone }).then((res) => {
      setSaving(false);
      if (res === "taken") {
        setErrs({ email: "Another account already uses this email" });
        buzz("error");
        setShake((n) => n + 1);
        return;
      }
      if (res === "error") return;
      setEditOpen(false);
      buzz("success");
      toast("Contact details updated", "success");
    });
  };

  const pick = async () => {
    setPhotoSheet(false);
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (r.canceled || !r.assets[0]) return;
    const a = r.assets[0];
    setPhoto(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
    buzz("light");
    toast("Profile photo updated");
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView key={rk} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomSpace }}>
        <LinearGradient colors={t.hero} style={{ paddingTop: insets.top + 18, paddingBottom: 56, alignItems: "center", borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, alignSelf: "flex-start", marginLeft: 22, marginBottom: 14 }} color="#fff">My profile</Text>
          <Tap onPress={() => setPhotoSheet(true)} accessibilityLabel="Change profile photo" scale={0.96}>
            <View style={{ padding: 4, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.18)" }}>
              <Avatar who={me} size={112} ring={t.gold} />
            </View>
            <View style={{ position: "absolute", right: 2, bottom: 6, width: 38, height: 38, borderRadius: 19, backgroundColor: t.gold, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: t.hero[0] }}>
              <Camera size={17} color="#1B2433" strokeWidth={2.5} />
            </View>
          </Tap>
          <Text style={{ fontFamily: font.heavy, fontSize: 24, marginTop: 14 }} color="#fff">{me.name}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Badge label={isAdmin ? "Admin" : "Resident"} tone="gold" />
            {me.unit ? <Badge label={`Unit ${me.unit}`} tone="neutral" /> : null}
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -28, gap: 16 }}>
          {place && (
            <Reveal i={0}>
              <Card pad={16} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: t.primarySoft, alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={23} color={t.primaryInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.semibold, fontSize: 12 }} color="mute">{isAdmin ? "You manage" : "Your residence"}</Text>
                  <Text v="sub" numberOfLines={1}>{place.name}</Text>
                  <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{place.kind === "residential" ? "Residential" : "Public place"} · {place.address}</Text>
                </View>
              </Card>
            </Reveal>
          )}

          <Reveal i={1}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, marginLeft: 4 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 12.5, letterSpacing: 1.2, textTransform: "uppercase", flex: 1 }} color="mute">Contact</Text>
              {isAdmin ? (
                <Tap onPress={openEdit} accessibilityLabel="Edit contact details" style={{ flexDirection: "row", alignItems: "center", gap: 5, height: 30, paddingHorizontal: 11, borderRadius: 15, backgroundColor: t.primarySoft }}>
                  <Pencil size={13} color={t.primaryInk} />
                  <Text style={{ fontFamily: font.bold, fontSize: 12.5 }} color="primaryInk">Edit</Text>
                </Tap>
              ) : null}
            </View>
            <Card pad={0} style={{ paddingHorizontal: 16 }}>
              <Row icon={Mail} label="Email" value={me.email} tone="info" onPress={isAdmin ? openEdit : undefined} />
              <Divider inset={52} />
              <Row icon={Phone} label="Phone" value={isAdmin ? me.phone : maskPhone(me.phone)} tone="success" onPress={isAdmin ? openEdit : undefined} />
            </Card>
            <Text style={{ fontFamily: font.medium, fontSize: 12, marginTop: 8, marginLeft: 4 }} color="mute">Member since {longDate(me.joinedAt)}</Text>
          </Reveal>

          {extra}

          <Reveal i={2}>
            <Text style={{ fontFamily: font.bold, fontSize: 12.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6, marginLeft: 4 }} color="mute">Preferences</Text>
            <Card pad={16} style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Moon size={18} color={t.sub} />
                <Text v="body" style={{ fontFamily: font.semibold }}>Appearance</Text>
              </View>
              <Segmented value={prefs.theme} onChange={(v) => setPrefs({ theme: v })} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
              <Divider />
              <Row icon={Vibrate} label="Haptic feedback" value="Subtle taps as you use the app" tone="gold" right={<Toggle on={prefs.haptics} onChange={(v) => setPrefs({ haptics: v })} />} />
              <Divider inset={52} />
              <Row icon={Bell} label="Notifications" value={isAdmin ? "New complaints and joins" : "Notices from your admin"} tone="primary" right={<Toggle on={prefs.notifications} onChange={(v) => setPrefs({ notifications: v })} />} />
            </Card>
          </Reveal>

          <Reveal i={3}>
            <Card pad={0} style={{ paddingHorizontal: 16 }}>
              <Row icon={Info} label="About ROES" value="Royal Organizing Ecosystem · v1.0.0" tone="neutral" />
              <Divider inset={52} />
              <Row icon={LogOut} label="Sign out" danger onPress={() => setOut(true)} />
            </Card>
          </Reveal>
        </View>
      </ScrollView>

      <Sheet visible={photoSheet} onClose={() => setPhotoSheet(false)} title="Profile photo" subtitle="Admins and neighbors see this next to your name" scroll={false}>
        <View style={{ alignItems: "center", paddingBottom: 18 }}><Avatar who={me} size={120} ring={t.gold} /></View>
        <View style={{ gap: 10, paddingBottom: 6 }}>
          <Tap onPress={pick} style={{ height: 54, borderRadius: radius.md, backgroundColor: t.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Camera size={19} color={t.onPrimary} /><Text v="body" style={{ fontFamily: font.bold }} color="onPrimary">Choose from library</Text>
          </Tap>
          {me.photo ? (
            <Tap onPress={() => { setPhoto(undefined); setPhotoSheet(false); toast("Photo removed", "info"); }} style={{ height: 54, borderRadius: radius.md, backgroundColor: t.dangerSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Trash2 size={19} color={t.danger} /><Text v="body" style={{ fontFamily: font.bold }} color="danger">Use illustrated avatar</Text>
            </Tap>
          ) : null}
        </View>
      </Sheet>
      <Sheet visible={editOpen} onClose={() => setEditOpen(false)} title="Contact details" subtitle="How residents and City Hall reach you" footer={<Button label="Save changes" onPress={saveContact} loading={saving} disabled={email.trim() === me.email && phone.trim() === me.phone} />}>
        <View style={{ gap: 14, paddingBottom: 10 }}>
          <Field label="Email" icon={Mail} value={email} onChangeText={(v) => { setEmail(v); setErrs((x) => ({ ...x, email: undefined })); }} error={errs.email} shakeKey={shake} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Field label="Phone" icon={Phone} value={phone} onChangeText={(v) => { setPhone(v); setErrs((x) => ({ ...x, phone: undefined })); }} error={errs.phone} shakeKey={shake} keyboardType="phone-pad" />
          <Text style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 17 }} color="mute">Your email is also your sign-in. Use the new address next time you log in.</Text>
        </View>
      </Sheet>
      <Confirm visible={out} title="Sign out of ROES?" text="You can sign back in any time with your email and password." confirm="Sign out" destructive={false} onClose={() => setOut(false)} onConfirm={() => { setOut(false); logout(); router.replace("/login"); }} />
    </View>
  );
}
