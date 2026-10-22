import { Building2, Landmark, Lock, type LucideIcon } from "lucide-react-native";
import type { Complaint } from "./types";
import type { Tone } from "@/ui/Misc";

export const KIND: Record<Complaint["kind"], { label: string; icon: LucideIcon; tone: Tone }> = {
  private: { label: "To my admin", icon: Lock, tone: "primary" },
  place: { label: "To a place's admin", icon: Building2, tone: "success" },
  public: { label: "To the mayor", icon: Landmark, tone: "gold" },
};

export const COMPLAINT_CATEGORIES = ["Facilities", "Noise", "Parking", "Waste", "Safety", "Cleanliness", "Access", "Other"];
