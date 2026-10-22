import { Car, Dumbbell, FileText, KeyRound, PawPrint, ShieldAlert, Trash2, VolumeX, type LucideIcon } from "lucide-react-native";
import type { RuleCategory } from "./types";
import type { Tone } from "@/ui/Misc";

export const RULE_META: Record<RuleCategory, { label: string; icon: LucideIcon; tone: Tone }> = {
  noise: { label: "Noise", icon: VolumeX, tone: "warn" },
  parking: { label: "Parking", icon: Car, tone: "info" },
  pets: { label: "Pets", icon: PawPrint, tone: "gold" },
  waste: { label: "Waste", icon: Trash2, tone: "success" },
  safety: { label: "Safety", icon: ShieldAlert, tone: "danger" },
  access: { label: "Access", icon: KeyRound, tone: "primary" },
  facilities: { label: "Facilities", icon: Dumbbell, tone: "info" },
  general: { label: "General", icon: FileText, tone: "neutral" },
};
export const RULE_CATEGORIES = Object.keys(RULE_META) as RuleCategory[];
