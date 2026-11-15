"use client";
import { useRef, useCallback, useEffect } from "react";
export function useSpeech() {
  const rec = useRef<any>(null); const text = useRef(""); const base = useRef(""); const want = useRef(false); const tok = useRef(0); const started = useRef(0);
  // Each utterance gets a token, so the "ended" event of a cancelled question can never mark a newer question as finished.
  const cancel = useCallback(() => { tok.current++; if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); }, []);
  const speak = useCallback((t: string, onEnd: () => void) => {
    if (typeof speechSynthesis === "undefined") { onEnd(); return; }
    const id = ++tok.current; const done = () => { if (id === tok.current) onEnd(); };
    const u = new SpeechSynthesisUtterance(t); u.onend = done; u.onerror = done; speechSynthesis.cancel(); speechSynthesis.speak(u); }, []);
  const listen = useCallback((onText: (t: string) => void, onError?: (msg: string) => void) => {
    const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!R) { onError?.("Speech recognition is not supported in this browser. Use Chrome or Edge."); return false; }
    want.current = false; rec.current?.abort?.(); rec.current = null;
    text.current = ""; base.current = ""; want.current = true;
    const fail = (message: string) => { want.current = false; rec.current = null; onError?.(message); };
    const errorMessage = (error: string) => {
      if (error === "not-allowed" || error === "service-not-allowed") return "Microphone access is blocked. Allow it in your browser settings and try again.";
      if (error === "audio-capture") return "No microphone was found.";
      if (error === "network") return "Speech recognition could not connect. Check your internet connection and try again.";
      if (error === "language-not-supported") return "Speech recognition does not support the selected language in this browser.";
      return "Speech recognition failed. Check your microphone and try again.";
    };
    const make = () => { const r = new R(); r.continuous = true; r.interimResults = true; r.lang = "en-IN";
      r.onresult = (e: any) => { const s = Array.from(e.results).map((x: any) => x[0].transcript).join(" "); text.current = (base.current + " " + s).trim(); onText(text.current); };
      r.onerror = (e: any) => {
        if (!want.current || e.error === "aborted" || e.error === "no-speech") return;
        fail(errorMessage(e.error));
      };
      // Browsers end recognition after a pause even in continuous mode. Restart it and keep what was said so far.
      r.onend = () => { if (!want.current || rec.current !== r) return;
        if (Date.now() - started.current < 800) { fail("Speech recognition stopped. Check your connection and try again."); return; }
        base.current = text.current;
        const n = make(); rec.current = n; started.current = Date.now();
        try { n.start(); } catch { fail("Speech recognition could not restart. Please try again."); }
      };
      return r; };
    const r = make(); rec.current = r; started.current = Date.now();
    try { r.start(); } catch { fail("Speech recognition could not start. Check microphone permissions and try again."); return false; }
    return true; }, []);
  // Resolves once the browser has delivered the final words, so the end of an answer is not lost.
  const stop = useCallback(() => new Promise<string>((res) => { want.current = false; const r = rec.current; rec.current = null; if (!r) return res(text.current);
    const done = () => res(text.current); r.onend = done; r.onerror = () => {}; try { r.stop(); } catch { done(); } setTimeout(done, 700); }), []);
  useEffect(() => () => { want.current = false; rec.current?.abort?.(); if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); }, []);
  return { speak, listen, stop, cancel };
}
