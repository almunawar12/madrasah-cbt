'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher-client';

export interface SessionParticipant {
  id: string;
  status: string;
  violationCount: number;
  score: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  user: {
    id: string;
    fullName: string;
    nis: string | null;
    class: { name: string } | null;
  };
}

export interface ViolationEvent {
  sessionId: string;
  userId: string;
  userName: string | null;
  type: string;
  violationCount: number;
  at: string;
}

export function useMonitoringSessions(examId: string) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<SessionParticipant[]>({
    queryKey: ['monitoring', examId],
    queryFn: async () => {
      const res = await fetch(`/api/exams/${examId}/sessions`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    refetchInterval: 30_000,
    enabled: !!examId,
  });

  const violationsRef = useRef<ViolationEvent[]>([]);

  useEffect(() => {
    if (!examId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`exam-${examId}`);

    channel.bind('session-joined', () => {
      qc.invalidateQueries({ queryKey: ['monitoring', examId] });
    });

    channel.bind('session-submitted', (data: { sessionId: string; score: number | null; at: string }) => {
      qc.setQueryData<SessionParticipant[]>(['monitoring', examId], (prev) =>
        prev?.map((s) =>
          s.id === data.sessionId
            ? { ...s, status: 'SUBMITTED', score: data.score, submittedAt: data.at }
            : s,
        ) ?? prev,
      );
    });

    channel.bind('violation', (event: ViolationEvent) => {
      violationsRef.current = [event, ...violationsRef.current].slice(0, 50);
      qc.setQueryData<SessionParticipant[]>(['monitoring', examId], (prev) =>
        prev?.map((s) =>
          s.id === event.sessionId
            ? { ...s, violationCount: event.violationCount }
            : s,
        ) ?? prev,
      );
      qc.invalidateQueries({ queryKey: ['monitoring-violations', examId] });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`exam-${examId}`);
    };
  }, [examId, qc]);

  return { sessions: data ?? [], isLoading, violationsRef };
}
