"use client";
import { useCallback, useRef, type MutableRefObject } from "react";
// Writes the live microphone loudness (0 to 1) into a ref, so a waveform can follow it without re-rendering React.
export function useMicLevel(level: MutableRefObject<number>) {
  const ctx = useRef<AudioContext | null>(null); const stream = useRef<MediaStream | null>(null); const raf = useRef(0); const gen = useRef(0);
  const stop = useCallback(() => { gen.current++; cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
    ctx.current?.close().catch(() => {}); ctx.current = null; level.current = 0; }, [level]);
  const start = useCallback(async () => {
    // Phones let only one thing hold the microphone, and speech recognition needs it. Use a gentle placeholder wave there.
    if (!window.matchMedia("(pointer: fine)").matches) { level.current = 0.4; return; }
    const mine = ++gen.current;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (mine !== gen.current) { s.getTracks().forEach((t) => t.stop()); return; }
      stream.current = s; const AC = window.AudioContext || (window as any).webkitAudioContext; const c: AudioContext = new AC(); ctx.current = c;
      const an = c.createAnalyser(); an.fftSize = 256; c.createMediaStreamSource(s).connect(an); const buf = new Uint8Array(an.frequencyBinCount);
      const loop = () => { an.getByteTimeDomainData(buf); let sum = 0; for (let i = 0; i < buf.length; i++) { const d = (buf[i] - 128) / 128; sum += d * d; }
        level.current = Math.min(1, Math.sqrt(sum / buf.length) * 4); raf.current = requestAnimationFrame(loop); };
      loop();
    } catch { level.current = 0.25; }
  }, [level]);
  return { start, stop };
}
