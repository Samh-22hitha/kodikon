import type { Scores } from "./store";
// Endpoint paths are assumptions: align them with the FastAPI contract. Each call falls back to mock data so the UI demos without the backend.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
let demo = false;
/** True when the last call could not reach the backend and returned sample data instead. */
export const isDemo = () => demo;

async function post<T>(path: string, body: BodyInit, json: boolean, fallback: () => T): Promise<T> {
  try {
    const r = await fetch(BASE + path, {
      method: "POST",
      body,
      headers: json ? { "Content-Type": "application/json" } : undefined,
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    demo = false;
    return d;
  } catch {
    demo = true;
    return fallback();
  }
}

async function get<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const r = await fetch(BASE + path, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    demo = false;
    return d;
  } catch {
    demo = true;
    return fallback();
  }
}

export const analyzeResume = (file: File, role: string) => {
  const f = new FormData();
  f.append("file", file);
  f.append("role", role);
  return post<{ session_id?: string; skills: string[]; questions: string[] }>("/resume/upload", f, false, () => ({
    session_id: "demo-session",
    skills: ["Java", "Spring Boot", "MySQL", "REST APIs"],
    questions: [
      "Walk me through the architecture of your most recent project.",
      "How did you handle errors and edge cases in that project?",
      "What would you change if the project had ten times more users?",
    ],
  }));
};

export const scoreAnswer = (q: string, transcript: string, attempt: number) =>
  post<Scores>("/interview/answer", JSON.stringify({ question: q, transcript }), true, () => {
    const n = Math.min(transcript.split(/\s+/).length, 80);
    const b = 50 + n / 3 + (attempt - 1) * 12;
    const j = () => Math.round(Math.min(96, b + Math.random() * 8));
    return { relevance: j(), clarity: j(), structure: j(), delivery: j() };
  });

export const generateFollowUp = (question: string, transcript: string) =>
  post<{ follow_up: string | null; reason: string }>(
    "/interview/follow-up",
    JSON.stringify({ question, transcript }),
    true,
    () => ({ follow_up: null, reason: "Follow-up generation is unavailable." }),
  );

export const submitReport = (sessionId: string, attempt: number, answers: any[]) =>
  post<any>("/report/generate", JSON.stringify({ session_id: sessionId, attempt, answers }), true, () => ({
    session_id: sessionId,
    attempt,
    overall_score: 80,
    answers,
    strong_areas: ["Clear communication", "Good structure"],
    weak_areas: ["Need more examples"],
    suggestions: ["Add more project evidence"],
  }));

export const fetchHistory = () =>
  get<{ attempts: any[] }>("/report/history", () => ({ attempts: [] }));

export const compareAttempts = (sessionId: string) =>
  get<{ session_id: string; attempts: any[] }>(`/report/compare/${sessionId}`, () => ({
    session_id: sessionId,
    attempts: [],
  }));
