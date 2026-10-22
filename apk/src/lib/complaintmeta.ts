import type { Palette } from "./theme";
import type { Tone } from "@/ui/Misc";
import type { Complaint, ComplaintStatus } from "./types";

export const STATUS: Record<ComplaintStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "danger" },
  in_review: { label: "In review", tone: "warn" },
  resolved: { label: "Resolved", tone: "success" },
};
export const PRIORITY: Record<Complaint["priority"], { label: string; tone: Tone }> = {
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "warn" },
  low: { label: "Low", tone: "neutral" },
};
export const priorityColor = (t: Palette, p: Complaint["priority"]) => (p === "high" ? t.danger : p === "medium" ? t.warn : t.mute);
