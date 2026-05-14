import { BookOpen, FileText, ClipboardList, BarChart3, Calendar, Tag } from 'lucide-react';
import { StatCard } from '@/components/atoms/stat-card';
import { Badge } from '@/components/atoms/badge';
import { auth } from '@/lib/auth';

export const metadata = { title: 'Dashboard Guru · SantriExam' };

const upcomingExams = [
  { date: '26', month: 'Okt', title: 'UTS Fiqh & Syariah', kelas: 'XII-A', time: '09:00', students: 45, status: 'ready' },
  { date: '28', month: 'Okt', title: 'Kuis Nahwu Dasar', kelas: 'X-C', time: '10:30', students: 38, status: 'draft' },
];

const recentQuestions = [
  { type: 'PG', label: 'PILIHAN GANDA', subject: 'Fiqh', level: 3, text: 'Jelaskan perbedaan mendasar antara akad Wadi\'ah Yad Amanah dan Wadi\'ah Yad Dhamanah...', time: '2 jam lalu' },
  { type: 'ES', label: 'ESSAY', subject: 'Adab', level: 5, text: 'Bandingkan gaya sastra puisi pra-Islam dengan era Islam awal dari perspektif nilai moral...', time: 'Kemarin' },
];

const gradingQueue = [
  { title: 'Kuis Aqidah Al-Awam', submitted: 8, initials: ['ZH', 'UF', '+6'] },
  { title: 'Terminologi Hadits', submitted: 10, initials: ['MY', 'AF', '+8'] },
];

export default async function GuruPage() {
  const session = await auth();
  const name = session?.user?.fullName ?? 'Ustadz';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Ahlan wa Sahlan, {name}</h2>
          <p className="text-sm text-on-surface-variant mt-1">Berikut ringkasan aktivitas akademik Anda hari ini.</p>
        </div>
        <div className="text-sm text-on-surface-variant bg-surface-container-high px-4 py-2 rounded-lg">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Soal" value="1.284" trend="+12 minggu ini" trendUp icon={BookOpen} iconVariant="primary" />
        <StatCard label="Ujian Dibuat" value="42" icon={FileText} iconVariant="primary" />
        <StatCard label="Perlu Dinilai" value="18" trend="Segera" icon={ClipboardList} iconVariant="tertiary" />
        <StatCard label="Rata-rata Nilai" value="84.5%" icon={BarChart3} iconVariant="primary" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Ujian Mendatang
              </h4>
              <button className="text-sm font-semibold text-primary hover:underline">Lihat Kalender</button>
            </div>
            <div className="divide-y divide-outline-variant/30">
              {upcomingExams.map((e) => (
                <div key={e.title} className="p-6 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container rounded-lg flex flex-col items-center justify-center text-on-surface-variant">
                      <span className="text-[10px] font-bold uppercase">{e.month}</span>
                      <span className="text-lg font-bold">{e.date}</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-on-surface">{e.title}</h5>
                      <p className="text-xs text-on-surface-variant">{e.kelas} · {e.time} · {e.students} Santri</p>
                    </div>
                  </div>
                  <Badge variant={e.status === 'ready' ? 'default' : 'secondary'}>
                    {e.status === 'ready' ? 'Siap' : 'Draft'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Soal Baru Ditambahkan
              </h4>
              <button className="text-sm font-semibold text-primary hover:underline">Kelola Bank</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentQuestions.map((q) => (
                <div key={q.text} className="p-4 border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <div className="flex justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${q.type === 'PG' ? 'text-primary-container bg-primary-fixed/20' : 'text-tertiary-container bg-tertiary-fixed/20'}`}>
                      {q.label}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{q.time}</span>
                  </div>
                  <p className="text-sm text-on-surface line-clamp-2 mb-3">{q.text}</p>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Tag className="w-3 h-3" />
                    <span className="text-xs">{q.subject} · Level {q.level}</span>
                  </div>
                </div>
              ))}
            </div>
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
              <p className="text-xs text-on-surface-variant mt-1">18 soal essay perlu diperiksa</p>
            </div>
            <div className="p-6 space-y-4">
              {gradingQueue.map((g) => (
                <div key={g.title} className="p-4 bg-surface-container-low rounded-lg relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 bg-tertiary" />
                  <h5 className="text-sm font-bold text-on-surface">{g.title}</h5>
                  <p className="text-xs text-on-surface-variant mt-1">{g.submitted} santri mengumpulkan</p>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {g.initials.map((init, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-surface-container-high ring-2 ring-surface flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
                          {init}
                        </div>
                      ))}
                    </div>
                    <button className="bg-tertiary text-white text-xs px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Nilai Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-container-low/50 text-center">
              <button className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                Lihat Semua Pengumpulan
              </button>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-lg font-semibold mb-2">Sumber Daya Guru</h4>
              <p className="text-sm mb-6 opacity-90">Panduan dan template kurikulum terkini.</p>
              <div className="space-y-3">
                {['Panduan Ujian 2024.pdf', 'Aset Kurikulum Fiqh'].map((r) => (
                  <a key={r} href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">{r}</span>
                  </a>
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
