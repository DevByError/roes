import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, api, errorMessage, setUnauthorizedHandler, tokenStore } from "./api";
import { toast } from "@/ui/Toast";
import type { Account, Complaint, ComplaintStatus, Donation, Notice, Place, PlaceReport, Prefs, Report, ReportStatus, Rule, RuleCategory, SafetyPolicy } from "./types";

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

export type LoginResult = { ok: true; account: Account } | { ok: false; error: "not_found" | "wrong_password" | "frozen" | "other"; message: string };

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  gender: "Female" | "Male";
  placeId: string;
  unit: string;
  photo?: string;
  code: string;
}

export interface BoardEntry {
  id: string;
  nick: string;
  score: number;
  placeId: string | null;
  me: boolean;
}

export interface RegisterPlace {
  id: string;
  name: string;
  district: string;
  address: string;
  category: string;
  residents: number;
}

interface Snapshot {
  sessionId: string | null;
  accounts: Account[];
  places: Place[];
  notices: Notice[];
  complaints: Complaint[];
  reports: Report[];
  placeReports: PlaceReport[];
  donations: Donation[];
  policies: SafetyPolicy[];
  seen: string[];
  pledged: Record<string, number>;
  board: BoardEntry[];
  myBest: number;
  myNick: string;
}

interface AppState extends Snapshot {
  hydrated: boolean;
  firstVisit: boolean;
  prefs: Prefs;
  registerPlaces: RegisterPlace[];

  init: () => Promise<void>;
  sync: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  loadRegisterPlaces: () => Promise<void>;
  requestCode: (email: string, purpose: "register" | "reset") => Promise<string | null>;
  verifyCode: (email: string, purpose: "register" | "reset", code: string) => Promise<string | null>;
  register: (input: RegisterInput) => Promise<string | null>;
  resetPassword: (email: string, code: string, password: string) => Promise<string | null>;
  clearFirstVisit: () => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setPhoto: (photo?: string) => Promise<void>;

  addNotice: (n: { title: string; body: string; pinned: boolean }) => Promise<void>;
  updateNotice: (id: string, n: Partial<Pick<Notice, "title" | "body" | "pinned">>) => Promise<void>;
  removeNotice: (id: string) => Promise<void>;

  addRule: (type: "residents" | "visitors", r: { title: string; text: string; category: RuleCategory }) => Promise<void>;
  updateRule: (type: "residents" | "visitors", id: string, r: Partial<Pick<Rule, "title" | "text" | "category">>) => Promise<void>;
  removeRule: (type: "residents" | "visitors", id: string) => Promise<void>;
  moveRule: (type: "residents" | "visitors", id: string, dir: -1 | 1) => Promise<void>;

  replyComplaint: (id: string, text: string) => Promise<void>;
  setComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  markRead: (id: string) => void;

  addComplaint: (c: { kind: Complaint["kind"]; placeId: string; subject: string; category: string; priority: Complaint["priority"]; body: string }) => Promise<string | null>;
  userReply: (id: string, text: string) => Promise<void>;
  markUserRead: (id: string) => void;
  addPlaceReport: (r: { placeId: string; category: RuleCategory; subject: string; details: string }) => Promise<string | null>;
  removePlaceReport: (id: string) => Promise<void>;
  addReport: (r: { category: RuleCategory; subject: string; details: string }) => Promise<string | null>;
  sendReportMessage: (id: string, text: string) => Promise<{ flagged: boolean } | null>;
  resolveReport: (id: string) => Promise<void>;
  escalateReport: (id: string) => Promise<void>;
  markReportRead: (id: string) => void;
  markSeen: (noticeId: string) => void;
  pledge: (donationId: string, amount: number) => Promise<boolean>;
  updateProfile: (p: { name: string; phone: string; gender: "Female" | "Male" }) => Promise<boolean>;
  updateContact: (p: { email: string; phone: string }) => Promise<"ok" | "taken" | "error">;
  changePassword: (current: string, next: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  setBest: (score: number) => Promise<void>;
  setNick: (nick: string) => Promise<string | null>;
}

const emptySnapshot = (): Snapshot => ({
  sessionId: null,
  accounts: [],
  places: [],
  notices: [],
  complaints: [],
  reports: [],
  placeReports: [],
  donations: [],
  policies: [],
  seen: [],
  pledged: {},
  board: [],
  myBest: 0,
  myNick: "",
});

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const me = () => get().accounts.find((a) => a.id === get().sessionId);

      let inflight: Promise<void> | null = null;
      const sync = () => {
        if (!tokenStore.get()) return Promise.resolve();
        if (inflight) return inflight;
        inflight = (async () => {
          try {
            const snap = await api<Snapshot & { city: unknown }>("GET", "/app/sync");
            const { city: _city, ...rest } = snap;
            void _city;
            set(rest);
          } finally {
            inflight = null;
          }
        })();
        return inflight;
      };

      const run = async (fn: () => Promise<unknown>) => {
        try {
          await fn();
          await sync();
        } catch (e) {
          toast(errorMessage(e), "error");
          await sync().catch(() => undefined);
        }
      };

      const signOut = () => {
        void tokenStore.set(null);
        set({ ...emptySnapshot(), firstVisit: false });
      };
      setUnauthorizedHandler(signOut);

      return {
        ...emptySnapshot(),
        hydrated: false,
        firstVisit: false,
        registerPlaces: [],
        prefs: { theme: "light", haptics: true, notifications: true },

        init: async () => {
          if (!useApp.persist.hasHydrated()) await new Promise<void>((resolve) => useApp.persist.onFinishHydration(() => resolve()));
          const token = await tokenStore.load();
          if (token) {
            try {
              await sync();
            } catch (e) {
              if (!(e instanceof ApiError && e.status === 0)) signOut();
            }
          }
          set({ hydrated: true });
        },
        sync,

        login: async (email, password) => {
          try {
            const r = await api<{ token: string }>("POST", "/auth/login", { email, password });
            await tokenStore.set(r.token);
            await sync();
            const account = me();
            if (!account) throw new ApiError(500, "Could not load your account");
            set({ firstVisit: false });
            return { ok: true, account };
          } catch (e) {
            await tokenStore.set(null);
            const code = e instanceof ApiError ? e.code : undefined;
            const error = code === "not_found" || code === "wrong_password" || code === "frozen" ? code : "other";
            return { ok: false, error, message: errorMessage(e) };
          }
        },
        logout: signOut,

        loadRegisterPlaces: async () => {
          try {
            set({ registerPlaces: await api<RegisterPlace[]>("GET", "/auth/places") });
          } catch (e) {
            toast(errorMessage(e), "error");
          }
        },
        requestCode: async (email, purpose) => {
          try {
            await api("POST", "/auth/code", { email, purpose });
            return null;
          } catch (e) {
            return errorMessage(e);
          }
        },
        verifyCode: async (email, purpose, code) => {
          try {
            await api("POST", "/auth/code/verify", { email, purpose, code });
            return null;
          } catch (e) {
            return errorMessage(e);
          }
        },
        register: async (input) => {
          try {
            const r = await api<{ token: string }>("POST", "/auth/register", input);
            await tokenStore.set(r.token);
            await sync();
            set({ firstVisit: true });
            return null;
          } catch (e) {
            await tokenStore.set(null);
            return errorMessage(e);
          }
        },
        resetPassword: async (email, code, password) => {
          try {
            await api("POST", "/auth/reset", { email, code, password });
            return null;
          } catch (e) {
            return errorMessage(e);
          }
        },
        clearFirstVisit: () => set({ firstVisit: false }),
        setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
        setPhoto: (photo) => run(() => api("PUT", "/app/profile/photo", { photo: photo ?? null })),

        addNotice: (n) => run(() => api("POST", "/app/notices", n)),
        updateNotice: (id, n) => run(() => api("PATCH", `/app/notices/${id}`, n)),
        removeNotice: (id) => run(() => api("DELETE", `/app/notices/${id}`)),

        addRule: (type, r) => run(() => api("POST", "/app/rules", { type, ...r })),
        updateRule: (_type, id, r) => run(() => api("PATCH", `/app/rules/${id}`, r)),
        removeRule: (_type, id) => run(() => api("DELETE", `/app/rules/${id}`)),
        moveRule: (_type, id, dir) => run(() => api("POST", `/app/rules/${id}/move`, { dir })),

        replyComplaint: async (id, text) => {
          set((s) => ({
            complaints: s.complaints.map((c) =>
              c.id === id ? { ...c, unread: false, status: c.status === "new" ? "in_review" : c.status, messages: [...c.messages, { id: uid("m"), from: "admin", text: text.trim(), at: nowIso() }] } : c,
            ),
          }));
          await run(() => api("POST", `/app/complaints/${id}/reply`, { text }));
        },
        setComplaintStatus: async (id, status) => {
          set((s) => ({ complaints: s.complaints.map((c) => (c.id === id ? { ...c, status, unread: false } : c)) }));
          await run(() => api("POST", `/app/complaints/${id}/status`, { status }));
        },
        markRead: (id) => {
          const c = get().complaints.find((x) => x.id === id);
          if (!c?.unread) return;
          set((s) => ({ complaints: s.complaints.map((x) => (x.id === id ? { ...x, unread: false } : x)) }));
          void api("POST", `/app/complaints/${id}/read`).catch(() => undefined);
        },

        addComplaint: async (c) => {
          try {
            const r = await api<{ id: string }>("POST", "/app/complaints", c);
            await sync();
            return r.id;
          } catch (e) {
            toast(errorMessage(e), "error");
            return null;
          }
        },
        userReply: async (id, text) => {
          set((s) => ({
            complaints: s.complaints.map((c) =>
              c.id === id ? { ...c, unread: true, status: c.status === "resolved" ? "in_review" : c.status, messages: [...c.messages, { id: uid("m"), from: "user", text: text.trim(), at: nowIso() }] } : c,
            ),
          }));
          await run(() => api("POST", `/app/complaints/${id}/reply`, { text }));
        },
        markUserRead: (id) => {
          const c = get().complaints.find((x) => x.id === id);
          if (!c?.userUnread) return;
          set((s) => ({ complaints: s.complaints.map((x) => (x.id === id ? { ...x, userUnread: false } : x)) }));
          void api("POST", `/app/complaints/${id}/read`).catch(() => undefined);
        },

        addPlaceReport: async (r) => {
          try {
            const res = await api<{ id: string }>("POST", "/app/place-reports", r);
            await sync();
            return res.id;
          } catch (e) {
            toast(errorMessage(e), "error");
            return null;
          }
        },
        removePlaceReport: (id) => run(() => api("DELETE", `/app/place-reports/${id}`)),
        addReport: async (r) => {
          try {
            const res = await api<{ id: string }>("POST", "/app/reports", r);
            await sync();
            return res.id;
          } catch (e) {
            toast(errorMessage(e), "error");
            return null;
          }
        },
        sendReportMessage: async (id, text) => {
          try {
            const r = await api<{ flagged: boolean }>("POST", `/app/reports/${id}/messages`, { text });
            await sync();
            return r;
          } catch (e) {
            toast(errorMessage(e), "error");
            await sync().catch(() => undefined);
            return null;
          }
        },
        resolveReport: (id) => run(() => api("POST", `/app/reports/${id}/resolve`)),
        escalateReport: (id) => run(() => api("POST", `/app/reports/${id}/escalate`)),
        markReportRead: (id) => {
          const r = get().reports.find((x) => x.id === id);
          if (!r?.unread) return;
          set((s) => ({ reports: s.reports.map((x) => (x.id === id ? { ...x, unread: false } : x)) }));
          void api("POST", `/app/reports/${id}/read`).catch(() => undefined);
        },
        markSeen: (noticeId) => {
          const key = `${get().sessionId}:${noticeId}`;
          if (get().seen.includes(key)) return;
          set((s) => ({ seen: [...s.seen, key] }));
          void api("POST", `/app/notices/${noticeId}/seen`).catch(() => undefined);
        },
        pledge: async (donationId, amount) => {
          try {
            await api("POST", `/app/donations/${donationId}/pledge`, { amount });
            await sync();
            return true;
          } catch (e) {
            toast(errorMessage(e), "error");
            await sync().catch(() => undefined);
            return false;
          }
        },
        updateProfile: async (p) => {
          try {
            await api("PATCH", "/app/profile", p);
            await sync();
            return true;
          } catch (e) {
            toast(errorMessage(e), "error");
            return false;
          }
        },
        updateContact: async (p) => {
          try {
            await api("PATCH", "/app/profile", p);
            await sync();
            return "ok";
          } catch (e) {
            if (e instanceof ApiError && e.code === "email_taken") return "taken";
            toast(errorMessage(e), "error");
            return "error";
          }
        },
        changePassword: async (current, next) => {
          try {
            await api("POST", "/auth/password", { current, next });
            return true;
          } catch {
            return false;
          }
        },
        deleteAccount: async () => {
          try {
            await api("DELETE", "/auth/me");
            signOut();
          } catch (e) {
            toast(errorMessage(e), "error");
          }
        },
        setNick: async (nick) => {
          try {
            await api("PUT", "/app/game/nick", { nick });
            await sync();
            return null;
          } catch (e) {
            return errorMessage(e);
          }
        },
        setBest: async (score) => {
          try {
            await api("POST", "/app/game/score", { score: Math.round(score) });
            await sync();
          } catch (e) {
            toast(errorMessage(e), "error");
          }
        },
      };
    },
    {
      name: "roes-mobile-v2",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ prefs: s.prefs }),
    },
  ),
);

export const useMe = () => useApp((s) => s.accounts.find((a) => a.id === s.sessionId));

export type { ReportStatus };
