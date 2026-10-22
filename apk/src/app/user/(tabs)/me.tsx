import { router } from "expo-router";
import { Gamepad2, HandHeart, ShieldCheck, UserCog } from "lucide-react-native";
import { TAB_SPACE } from "@/features/admin/TabBar";
import { ProfileView } from "@/features/profile/ProfileView";
import { font } from "@/lib/theme";
import { Card, Divider, Reveal, Row } from "@/ui/Misc";
import { Text } from "@/ui/Text";

export default function Me() {
  return (
    <ProfileView
      bottomSpace={TAB_SPACE + 24}
      extra={
        <Reveal i={1}>
          <Text style={{ fontFamily: font.bold, fontSize: 12.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6, marginLeft: 4 }} color="mute">Your account</Text>
          <Card pad={0} style={{ paddingHorizontal: 16 }}>
            <Row icon={UserCog} label="Manage account" value="Name, phone, password, delete" tone="primary" onPress={() => router.push("/user/account")} />
            <Divider inset={52} />
            <Row icon={ShieldCheck} label="Safety & policies" value="Emergency numbers and policies" tone="danger" onPress={() => router.push("/user/safety")} />
            <Divider inset={52} />
            <Row icon={HandHeart} label="Donations" value="Support causes in your city" tone="gold" onPress={() => router.push("/user/donations")} />
            <Divider inset={52} />
            <Row icon={Gamepad2} label="Tidy Town game" value="A quick recycling game" tone="success" onPress={() => router.push("/user/game")} />
          </Card>
        </Reveal>
      }
    />
  );
}
