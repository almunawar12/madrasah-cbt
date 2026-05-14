import { create } from 'zustand';

export interface ParticipantStatus {
  userId: string;
  name: string;
  nis: string | null;
  progress: number;
  violationCount: number;
  status: 'online' | 'offline' | 'submitted' | 'blocked';
  lastSeen: Date;
}

interface MonitoringState {
  examId: string | null;
  participants: Map<string, ParticipantStatus>;
  setExam: (examId: string) => void;
  upsertParticipant: (p: ParticipantStatus) => void;
  blockParticipant: (userId: string) => void;
  reset: () => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  examId: null,
  participants: new Map(),

  setExam: (examId) => set({ examId, participants: new Map() }),

  upsertParticipant: (p) =>
    set((s) => {
      const next = new Map(s.participants);
      next.set(p.userId, p);
      return { participants: next };
    }),

  blockParticipant: (userId) =>
    set((s) => {
      const next = new Map(s.participants);
      const p = next.get(userId);
      if (p) next.set(userId, { ...p, status: 'blocked' });
      return { participants: next };
    }),

  reset: () => set({ examId: null, participants: new Map() }),
}));
