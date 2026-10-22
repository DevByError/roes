import { View } from "react-native";
import { Image } from "expo-image";
import { Text } from "./Text";

export function CrownMark({ size = 40 }: { size?: number; color?: string }) {
  return <Image source={require("../../assets/images/logo.png")} style={{ width: size, height: size }} contentFit="contain" accessibilityIgnoresInvertColors />;
}

export function LogoTile({ size = 64 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, overflow: "hidden" }}>
      <CrownMark size={size} />
    </View>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <View>
      <Text style={{ fontSize: 22, letterSpacing: 4, fontWeight: "800" }} color={light ? "#fff" : "text"}>
        ROES
      </Text>
      <Text v="label" color={light ? "rgba(255,255,255,0.6)" : "mute"} style={{ fontSize: 8.5, letterSpacing: 1.7, marginTop: 2 }}>
        Royal Organizing Ecosystem
      </Text>
    </View>
  );
}
