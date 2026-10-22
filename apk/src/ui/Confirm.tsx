import { View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { Button } from "./Button";
import { Sheet } from "./Sheet";
import { Text } from "./Text";

export function Confirm({ visible, title, text, confirm, onConfirm, onClose, destructive = true, loading }: { visible: boolean; title: string; text: string; confirm: string; onConfirm: () => void; onClose: () => void; destructive?: boolean; loading?: boolean }) {
  const { t } = useTheme();
  return (
    <Sheet visible={visible} onClose={onClose} scroll={false}>
      <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 22, gap: 10 }}>
        <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: destructive ? t.dangerSoft : t.primarySoft, alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={28} color={destructive ? t.danger : t.primary} />
        </View>
        <Text v="heading" style={{ textAlign: "center" }}>{title}</Text>
        <Text v="body" color="sub" style={{ textAlign: "center", maxWidth: 300 }}>{text}</Text>
      </View>
      <View style={{ gap: 10, paddingBottom: 6 }}>
        <Button label={confirm} variant={destructive ? "danger" : "primary"} onPress={onConfirm} loading={loading} />
        <Button label="Cancel" variant="ghost" onPress={onClose} />
      </View>
    </Sheet>
  );
}
