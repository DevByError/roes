import { useMemo } from "react";
import { useApp, useMe } from "@/lib/store";

const DAY = 86_400_000;

export function useAdminCtx() {
  const me = useMe();
  const places = useApp((s) => s.places);
  const accounts = useApp((s) => s.accounts);
  const allNotices = useApp((s) => s.notices);
  const allComplaints = useApp((s) => s.complaints);

  return useMemo(() => {
    const place = places.find((p) => p.id === me?.placeId);
    const residential = place?.kind === "residential";
    const residents = accounts.filter((a) => a.role === "user" && a.placeId === place?.id).sort((a, b) => +new Date(b.joinedAt) - +new Date(a.joinedAt));
    const notices = allNotices.filter((n) => n.placeId === place?.id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.createdAt) - +new Date(a.createdAt));
    const complaints = allComplaints.filter((c) => c.placeId === place?.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const now = Date.now();
    const newThisMonth = residents.filter((r) => now - +new Date(r.joinedAt) < 30 * DAY).length;
    const prevMonth = residents.filter((r) => { const d = now - +new Date(r.joinedAt); return d >= 30 * DAY && d < 60 * DAY; }).length;
    const weekly = Array.from({ length: 8 }, (_, i) => {
      const from = now - (8 - i) * 7 * DAY;
      const to = from + 7 * DAY;
      return residents.filter((r) => { const t = +new Date(r.joinedAt); return t >= from && t < to; }).length;
    });
    const open = complaints.filter((c) => c.status !== "resolved");
    return {
      me,
      place,
      residential: !!residential,
      residents,
      notices,
      complaints,
      open,
      unread: complaints.filter((c) => c.unread).length,
      newThisMonth,
      prevMonth,
      weekly,
      rulesTotal: place ? place.rules.residents.length + place.rules.visitors.length : 0,
    };
  }, [me, places, accounts, allNotices, allComplaints]);
}

export function useAdminAnnouncements() {
  const me = useMe();
  const notices = useApp((s) => s.notices);
  const seen = useApp((s) => s.seen);
  return useMemo(() => {
    const mayor = notices.filter((n) => n.placeId === "city").sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.createdAt) - +new Date(a.createdAt));
    const mine = notices.filter((n) => n.placeId === me?.placeId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const isSeen = (n: { id: string }) => seen.includes(`${me?.id}:${n.id}`);
    return { me, mayor, mine, all: [...mayor, ...mine].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), isSeen, unseenMayor: mayor.filter((n) => !isSeen(n)).length };
  }, [me, notices, seen]);
}
