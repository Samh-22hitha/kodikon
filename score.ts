import { avg, type Answer, type Scores } from "./store";
export const KEYS: (keyof Scores)[] = ["relevance", "clarity", "structure", "delivery"];
export const LABEL: Record<keyof Scores, string> = { relevance: "Relevance", clarity: "Clarity", structure: "Structure", delivery: "Delivery" };
export const overall = (a: Answer[]) => Math.round(KEYS.reduce((t, k) => t + avg(a, k), 0) / KEYS.length);
export const answerScore = (x: Answer) => Math.round(KEYS.reduce((t, k) => t + x.scores[k], 0) / KEYS.length);
export const tier = (n: number) => n >= 80 ? { label: "Strong", text: "text-ok", bg: "bg-ok", hex: "#10B981" }
  : n >= 65 ? { label: "Solid", text: "text-cyan", bg: "bg-cyan", hex: "#00D9FF" }
  : { label: "Needs practice", text: "text-amber-300", bg: "bg-amber-300", hex: "#FCD34D" };
export const TIPS: Record<keyof Scores, { title: string; tip: string }> = {
  relevance: { title: "Answer the question that was asked", tip: "Open with a one-sentence answer, then back it up with an example from your own project." },
  clarity: { title: "Simplify your wording", tip: "Use short sentences and name the technology or decision before you explain it." },
  structure: { title: "Give your answer a shape", tip: "Try context, action, result: what the situation was, what you did, and what happened." },
  delivery: { title: "Slow down and finish strong", tip: "Pause between points and end on the outcome instead of trailing off." },
};
