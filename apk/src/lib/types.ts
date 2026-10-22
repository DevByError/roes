export type Role = "admin" | "user";
export type PlaceKind = "residential" | "non-residential";
export type RuleCategory = "noise" | "parking" | "pets" | "waste" | "safety" | "access" | "facilities" | "general";

export interface Account {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  gender: "Female" | "Male";
  photo?: string;
  status: "active" | "frozen";
  placeId: string | null;
  unit?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface Rule {
  id: string;
  title: string;
  text: string;
  category: RuleCategory;
  updatedAt: string;
}

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  category: string;
  district: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  rules: { residents: Rule[]; visitors: Rule[] };
}

export interface Notice {
  id: string;
  placeId: string;
  audience: "private" | "public";
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  authorId: string;
}

export type ComplaintStatus = "new" | "in_review" | "resolved";
export interface ComplaintMessage {
  id: string;
  from: "user" | "admin";
  text: string;
  at: string;
}
export interface Complaint {
  id: string;
  placeId: string;
  kind: "private" | "place" | "public";
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: ComplaintStatus;
  fromId: string;
  createdAt: string;
  unread: boolean;
  userUnread?: boolean;
  messages: ComplaintMessage[];
}

export interface Prefs {
  theme: "light" | "dark";
  haptics: boolean;
  notifications: boolean;
}

export interface ReportMessage {
  id: string;
  from: string;
  text: string;
  at: string;
  flagged?: boolean;
}
export type ReportStatus = "open" | "resolved" | "escalated";
export interface Report {
  id: string;
  placeId: string;
  fromId: string;
  againstId: string;
  category: RuleCategory;
  subject: string;
  status: ReportStatus;
  strikes: number;
  createdAt: string;
  unread?: boolean;
  messages: ReportMessage[];
}

export interface SafetyPolicy {
  id: string;
  title: string;
  category: "Fire" | "Flood" | "Health" | "Traffic" | "Crime" | "General";
  severity: "critical" | "important" | "info";
  summary: string;
  body: string;
}

export type DonationCover = "flood" | "school" | "kitchen" | "hospital";
export interface Donation {
  id: string;
  title: string;
  category: string;
  description: string;
  goal: number;
  raised: number;
  donors: number;
  deadline: string;
  status: "active" | "closed";
  cover: DonationCover;
  image?: string;
}

export interface PlaceReport {
  id: string;
  placeId: string;
  fromId: string;
  category: RuleCategory;
  subject: string;
  details: string;
  createdAt: string;
}
