import { useMemo } from "react";
import { useApp, useMe } from "@/lib/store";
import type { Notice } from "@/lib/types";

export const CITY = "City Hall";

export function useUserCtx() {
  const me = useMe();
  const places = useApp((s) => s.places);
  const allNotices = useApp((s) => s.notices);
  const complaints = useApp((s) => s.complaints);
  const reports = useApp((s) => s.reports);
  const accounts = useApp((s) => s.accounts);
  const seen = useApp((s) => s.seen);

  return useMemo(() => {
    const place = places.find((p) => p.id === me?.placeId);
    const notices = allNotices
      .filter((n) => n.audience === "public" || n.placeId === me?.placeId)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.createdAt) - +new Date(a.createdAt));
    const isSeen = (n: Notice) => seen.includes(`${me?.id}:${n.id}`);
    const unseen = notices.filter((n) => !isSeen(n)).length;
    const announcements = notices.filter((n) => n.placeId === "city" || n.placeId === me?.placeId);
    const unseenAnnouncements = announcements.filter((n) => !isSeen(n)).length;
    const myComplaints = complaints.filter((c) => c.fromId === me?.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const myReports = reports.filter((r) => r.fromId === me?.id || r.againstId === me?.id || (r.againstId === "all" && r.placeId === me?.placeId)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const sourceOf = (n: Notice) => (n.placeId === "city" ? CITY : places.find((p) => p.id === n.placeId)?.name ?? "Community");
    const neighbors = accounts.filter((a) => a.role === "user" && a.placeId === me?.placeId && a.id !== me?.id);
    return {
      me,
      place,
      places,
      notices,
      isSeen,
      unseen,
      announcements,
      unseenAnnouncements,
      myComplaints,
      myReports,
      openComplaints: myComplaints.filter((c) => c.status !== "resolved"),
      helpBadge: myComplaints.filter((c) => c.userUnread).length + myReports.filter((r) => r.unread && r.status === "open").length,
      sourceOf,
      neighbors,
      accounts,
    };
  }, [me, places, allNotices, complaints, reports, accounts, seen]);
}
