import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { moderate } from "@/lib/moderation";

export interface BoardRow {
  id: string;
  nick: string;
  score: number;
  placeId: string | null;
  me: boolean;
  rank: number;
}

export function useBoard() {
  const board = useApp((s) => s.board);
  const myNick = useApp((s) => s.myNick);

  return useMemo(() => {
    const raw = [...board].sort((a, b) => b.score - a.score || a.nick.localeCompare(b.nick));
    const rows: BoardRow[] = raw.map((r, i) => ({ ...r, rank: i > 0 && raw[i - 1].score === r.score ? 0 : i + 1 }));
    rows.forEach((r, i) => {
      if (r.rank === 0) r.rank = rows[i - 1].rank;
    });
    return { rows, mine: rows.find((r) => r.me) ?? null, myNick, taken: [] as string[] };
  }, [board, myNick]);
}

export function nickError(raw: string, taken: string[]): string | null {
  const n = raw.trim().replace(/\s+/g, " ");
  if (n.length < 2) return "Use at least 2 characters.";
  if (n.length > 14) return "Keep it to 14 characters or less.";
  if (!/^[A-Za-z0-9][A-Za-z0-9 _.-]*$/.test(n)) return "Letters, numbers, spaces, _ . - only.";
  if (!moderate(n).ok) return "Please choose a friendlier nickname.";
  if (taken.includes(n.toLowerCase())) return "Someone already has that nickname.";
  return null;
}
export const cleanNick = (raw: string) => raw.trim().replace(/\s+/g, " ");
