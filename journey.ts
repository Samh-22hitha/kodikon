"use client";
import { useStore } from "./store";
export type Next = { title: string; body: string; cta: string; href: string; retry?: boolean };
// One place that knows where the user is in the flow: resume, attempt 1, attempt 2, mirror.
export function useJourney() {
  const { skills, rounds, round, startRound } = useStore();
  const analysed = skills.length > 0, a1 = rounds[1].length > 0, a2 = rounds[2].length > 0;
  const next: Next = !analysed ? { title: "Start with your resume", body: "Upload a PDF and we will write interview questions about your own projects.", cta: "Upload resume", href: "/resume" }
    : !a1 ? { title: "Your questions are ready", body: "Enter the interview room and answer out loud. Take your time.", cta: "Enter interview room", href: "/interview" }
    : !a2 ? { title: "Beat your first score", body: "Retry the same questions and see exactly what improved.", cta: "Retry the same questions", href: "/interview", retry: true }
    : { title: "Both attempts are recorded", body: "See your two attempts side by side.", cta: "See your progress", href: "/mirror" };
  // Call from the link's onClick: starting attempt 2 clears any half-finished second attempt.
  const begin = () => { if (next.retry && round !== 2) startRound(2); };
  return { analysed, a1, a2, next, begin };
}
