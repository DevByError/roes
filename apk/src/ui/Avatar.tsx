import { Image, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { portraitSvg } from "@/lib/avatar";
import { useTheme } from "@/lib/theme";
import type { Account } from "@/lib/types";

export function Avatar({
  who,
  name,
  photo,
  gender,
  size = 44,
  ring,
}: {
  who?: Pick<Account, "name" | "photo" | "gender">;
  name?: string;
  photo?: string;
  gender?: "Female" | "Male";
  size?: number;
  ring?: string | boolean;
}) {
  const { t } = useTheme();
  const n = who?.name ?? name ?? "?";
  const p = who?.photo ?? photo;
  const g = who?.gender ?? gender;
  const ringColor = typeof ring === "string" ? ring : t.surface;
  const w = ring ? 3 : 0;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: t.surface2,
        borderWidth: w,
        borderColor: ringColor,
      }}
    >
      {p ? (
        <Image source={{ uri: p }} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <SvgXml xml={portraitSvg(n, g)} width="100%" height="100%" />
      )}
    </View>
  );
}
