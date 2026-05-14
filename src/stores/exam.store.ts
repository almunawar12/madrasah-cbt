import { create } from 'zustand';

interface ExamState {
  examId: string | null;
  token: string | null;
  timeLeft: number;
  currentQuestion: number;
  totalQuestions: number;
  markedQuestions: Set<number>;
  isFullscreen: boolean;
  violationCount: number;
  setExam: (examId: string, token: string, totalQuestions: number, durationSec: number) => void;
  setCurrentQuestion: (index: number) => void;
  toggleMark: (index: number) => void;
  decrementTimer: () => void;
  addViolation: () => void;
  setFullscreen: (v: boolean) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  examId: null,
  token: null,
  timeLeft: 0,
  currentQuestion: 0,
  totalQuestions: 0,
  markedQuestions: new Set(),
  isFullscreen: false,
  violationCount: 0,

  setExam: (examId, token, totalQuestions, durationSec) =>
    set({ examId, token, totalQuestions, timeLeft: durationSec, currentQuestion: 0 }),

  setCurrentQuestion: (index) => set({ currentQuestion: index }),

  toggleMark: (index) =>
    set((s) => {
      const next = new Set(s.markedQuestions);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return { markedQuestions: next };
    }),

  decrementTimer: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),

  addViolation: () => set((s) => ({ violationCount: s.violationCount + 1 })),

  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  reset: () =>
    set({
      examId: null,
      token: null,
      timeLeft: 0,
      currentQuestion: 0,
      totalQuestions: 0,
      markedQuestions: new Set(),
      isFullscreen: false,
      violationCount: 0,
    }),
}));
