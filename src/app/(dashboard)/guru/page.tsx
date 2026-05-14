import { BookOpen, FileText, ClipboardList, BarChart3, Calendar, Tag } from 'lucide-react';
import { StatCard } from '@/components/atoms/stat-card';
import { Badge } from '@/components/atoms/badge';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = { title: 'Dashboard Guru · SantriExam' };

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

function getInitials(n: string) {
  return n.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default async function GuruPage() {
  const session = await auth();
  const name = session?.user?.fullName ?? 'Ustadz';
  const now = new Date();

  const [
    totalQuestions,
    totalExams,
    essayPending,
    avgScoreRaw,
    totalSessions,
    doneSessions,
    upcomingExams,
    recentQuestions,
    gradingQueue,
  ] = await Promise.all([
    prisma.question.count(),

    prisma.exam.count(),

    prisma.answer.count({
      where: { question: { type: 'ESSAY' }, isCorrect: null, essayText: { not: null } },
    }),

    prisma.examSession.aggregate({
      _avg: { score: true },
      where: { status: { in: ['SUBMITTED', 'FORCE_SUBMITTED'] }, score: { not: null } },
    }),

    prisma.examSession.count(),

    prisma.examSession.count({
      where: { status: { in: ['SUBMITTED', 'FORCE_SUBMITTED'] } },
    }),

    prisma.exam.findMany({
      where: {
        status: { in: ['PUBLISHED', 'ONGOING'] },
        OR: [{ endTime: null }, { endTime: { gt: now } }],
      },
      orderBy: { startTime: 'asc' },
      take: 5,
      include: {
        subject: { select: { name: true } },
        _count: { select: { sessions: true } },
      },
    }),

    prisma.question.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { subject: { select: { name: true } } },
    }),

    prisma.exam.findMany({
      where: {
        sessions: {
          some: {
            answers: {
              some: { question: { type: 'ESSAY' }, isCorrect: null, essayText: { not: null } },
            },
          },
        },
      },
      take: 3,
      include: {
        _count: { select: { sessions: true } },
        sessions: {
          where: {
            answers: {
              some: { question: { type: 'ESSAY' }, isCorrect: null, essayText: { not: null } },
            },
          },
          select: { user: { select: { fullName: true } } },
          take: 3,
        },
      },
    }),
  ]);

  const avgScore = avgScoreRaw._avg.score;
  const pctDone = totalSessions > 0 ? Math.round((doneSessions / totalSessions) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Ahlan wa Sahlan, {name}</h2>
          <p className="text-sm text-on-surface-variant mt-1">Berikut ringkasan aktivitas akademik hari ini.</p>
        </div>
        <div className="text-sm text-on-surface-variant bg-surface-container-high px-4 py-2 rounded-lg hidden sm:block">
          {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Soal" value={totalQuestions.toLocaleString('id')} icon={BookOpen} iconVariant="primary" />
        <StatCard label="Ujian Dibuat" value={totalExams.toLocaleString('id')} icon={FileText} iconVariant="primary" />
        <StatCard label="Perlu Dinilai" value={String(essayPending)} trend={essayPending > 0 ? 'Segera' : undefined} icon={ClipboardList} iconVariant="tertiary" />
        <StatCard label="Rata-rata Nilai" value={avgScore != null ? avgScore.toFixed(1) : '—'} icon={BarChart3} iconVariant="primary" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Ujian Aktif & Mendatang
              </h4>
              <Link href="/guru/exams" className="text-sm font-semibold text-primary hover:underline">Lihat Semua</Link>
            </div>
            {upcomingExams.length === 0 ? (
              <div className="p-8 text-center text-sm text-on-surface-variant">Tidak ada ujian aktif saat ini.</div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {upcomingExams.map((e) => {
                  const d = e.startTime ?? e.createdAt;
                  return (
                    <div key={e.id} className="p-6 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container rounded-lg flex flex-col items-center justify-center text-on-surface-variant flex-shrink-0">
                          <span className="text-[10px] font-bold uppercase">
                            {d.toLocaleDateString('id-ID', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold">{d.getDate()}</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-on-surface">{e.title}</h5>
                          <p className="text-xs text-on-surface-variant">
                            {e.subject.name} · {e.duration} menit · {e._count.sessions} peserta
                          </p>
                        </div>
                      </div>
                      <Badge variant={e.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {e.status === 'PUBLISHED' ? 'Siap' : 'Aktif'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Questions */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Soal Terbaru
              </h4>
              <Link href="/guru/questions" className="text-sm font-semibold text-primary hover:underline">Kelola Bank</Link>
            </div>
            {recentQuestions.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-4">Belum ada soal.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentQuestions.map((q) => (
                  <div key={q.id} className="p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <div className="flex justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${q.type === 'MULTIPLE_CHOICE' ? 'text-primary-container bg-primary-fixed/20' : 'text-tertiary-container bg-tertiary-fixed/20'}`}>
                        {q.type === 'MULTIPLE_CHOICE' ? 'PILIHAN GANDA' : 'ESSAY'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">{formatRelative(q.createdAt)}</span>
                    </div>
                    <p className="text-sm text-on-surface line-clamp-2 mb-3">{q.text}</p>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Tag className="w-3 h-3" />
                      <span className="text-xs">{q.subject.name} · {q.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Grading Queue */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-tertiary-container/20">
            <div className="p-6 bg-tertiary-container/5 rounded-t-xl border-b border-tertiary-container/10">
              <h4 className="text-lg font-semibold text-tertiary flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> Antrian Penilaian
              </h4>
              <p className="text-xs text-on-surface-variant mt-1">
                {essayPending > 0 ? `${essayPending} soal essay perlu diperiksa` : 'Semua essay sudah dinilai'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {gradingQueue.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-2">Tidak ada antrian.</p>
              ) : gradingQueue.map((g) => (
                <div key={g.id} className="p-4 bg-surface-container-low rounded-lg relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 bg-tertiary" />
                  <h5 className="text-sm font-bold text-on-surface">{g.title}</h5>
                  <p className="text-xs text-on-surface-variant mt-1">{g._count.sessions} santri mengumpulkan</p>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {g.sessions.map((s, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-surface-container-high ring-2 ring-surface flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
                          {getInitials(s.user.fullName)}
                        </div>
                      ))}
                    </div>
                    <Link href="/guru/grading" className="bg-tertiary text-white text-xs px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Nilai Sekarang
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-container-low/50 text-center">
              <Link href="/guru/grading" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                Lihat Semua Pengumpulan
              </Link>
            </div>
          </div>

          {/* Session Stats */}
          <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-lg font-semibold mb-4">Statistik Sesi</h4>
              <div className="space-y-2">
                {[
                  { label: 'Total Sesi', value: totalSessions.toLocaleString('id') },
                  { label: 'Selesai', value: doneSessions.toLocaleString('id') },
                  { label: 'Persentase Selesai', value: `${pctDone}%` },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="opacity-80">{s.label}</span>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <BookOpen className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
