import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { router, type Href } from "expo-router";
import { LogOut, UserRound } from "lucide-react-native";
import { useApp, useMe } from "@/lib/store";
import { font } from "@/lib/theme";
import { Avatar } from "@/ui/Avatar";
import { Confirm } from "@/ui/Confirm";
import { Card, Divider, Row } from "@/ui/Misc";
import { Sheet } from "@/ui/Sheet";
import { Tap } from "@/ui/Tap";
import { Text } from "@/ui/Text";

export function AvatarMenu({ profile, children }: { profile: Href; children: ReactNode }) {
  const me = useMe();
  const logout = useApp((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Tap onPress={() => setOpen(true)} accessibilityLabel="Profile menu" scale={0.94}>{children}</Tap>
      <Sheet visible={open} onClose={() => setOpen(false)} scroll={false}>
        <View style={{ paddingBottom: 14, gap: 16 }}>
          {me ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Avatar who={me} size={54} />
              <View style={{ flex: 1 }}>
                <Text v="sub" numberOfLines={1}>{me.name}</Text>
                <Text style={{ fontFamily: font.medium, fontSize: 12.5 }} color="sub" numberOfLines={1}>{me.email}</Text>
              </View>
            </View>
          ) : null}
          <Card pad={0} style={{ paddingHorizontal: 16 }}>
            <Row icon={UserRound} label="Go to profile" tone="primary" onPress={() => { setOpen(false); router.navigate(profile); }} />
            <Divider inset={52} />
            <Row icon={LogOut} label="Log out" tone="danger" danger onPress={() => { setOpen(false); setTimeout(() => setConfirm(true), 250); }} />
          </Card>
        </View>
      </Sheet>
      <Confirm visible={confirm} title="Sign out of ROES?" text="You can sign back in any time with your email and password." confirm="Sign out" destructive={false} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); logout(); router.replace("/login"); }} />
    </>
  );
}
