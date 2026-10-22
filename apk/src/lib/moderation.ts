export type Flag = "insult" | "threat" | "shouting";
export interface Verdict {
  ok: boolean;
  flag?: Flag;
}

const INSULTS = /\b(idiot|stupid|dumb|moron|useless|pathetic|bastard|jerk|loser|shut up|bodoh|sial|babi|celaka|bangang|fool|trash|scum|hate you|asshole|bitch)\b/i;
const SWEARS = /\b(f+u+c+k+\w*|shit\w*|crap|damn you)\b/i;
const THREATS = /\b(kill|beat|hurt|smash|punch|stab|burn)\b.{0,12}\b(you|him|her|them|your)\b|\bi('| wi)ll (get|find|teach) you\b|\bor else\b/i;

export function moderate(text: string): Verdict {
  const t = text.trim();
  if (THREATS.test(t)) return { ok: false, flag: "threat" };
  if (INSULTS.test(t) || SWEARS.test(t)) return { ok: false, flag: "insult" };
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 14 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7) return { ok: false, flag: "shouting" };
  return { ok: true };
}
