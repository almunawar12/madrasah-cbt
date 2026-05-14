'use client';

import { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

type ViolationType = 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE' | 'RIGHT_CLICK';

interface UseAntiCheatOptions {
  sessionId: string;
  enabled?: boolean;
  onViolation?: (type: ViolationType, count: number) => void;
}

async function reportViolation(sessionId: string, type: ViolationType) {
  try {
    await fetch(`/api/sessions/${sessionId}/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
  } catch {
    // silent — don't block user on network error
  }
}

export function useAntiCheat({ sessionId, enabled = true, onViolation }: UseAntiCheatOptions) {
  const countRef = useRef(0);

  const handleViolation = useCallback((type: ViolationType) => {
    if (!enabled) return;
    countRef.current += 1;
    onViolation?.(type, countRef.current);
    reportViolation(sessionId, type);

    const messages: Record<ViolationType, string> = {
      TAB_SWITCH: 'Peringatan: Berpindah tab terdeteksi!',
      FULLSCREEN_EXIT: 'Peringatan: Keluar dari fullscreen terdeteksi!',
      COPY_PASTE: 'Peringatan: Copy/paste tidak diizinkan!',
      RIGHT_CLICK: 'Klik kanan tidak diizinkan selama ujian.',
    };
    toast.error(messages[type], { duration: 3000 });
  }, [sessionId, enabled, onViolation]);

  // Tab visibility change
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      if (document.hidden) handleViolation('TAB_SWITCH');
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [enabled, handleViolation]);

  // Fullscreen exit
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      if (!document.fullscreenElement) handleViolation('FULLSCREEN_EXIT');
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [enabled, handleViolation]);

  // Copy/paste
  useEffect(() => {
    if (!enabled) return;
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); handleViolation('COPY_PASTE'); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); handleViolation('COPY_PASTE'); };
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); handleViolation('COPY_PASTE'); };
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
    };
  }, [enabled, handleViolation]);

  // Right click
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MouseEvent) => { e.preventDefault(); handleViolation('RIGHT_CLICK'); };
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, [enabled, handleViolation]);

  // Block devtools shortcuts (F12, Ctrl+Shift+I/J/U)
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return; }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // fullscreen not supported or denied
    }
  }, []);

  return { violationCount: countRef.current, requestFullscreen };
}
