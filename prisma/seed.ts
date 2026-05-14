import { PrismaClient, Role, Difficulty, QuestionType, ExamStatus, SessionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function token(seg1: string, seg2: string, seg3: string) {
  return `${seg1}-${seg2}-${seg3}`;
}

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // ─── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@madrasah.test' },
    update: {},
    create: { email: 'admin@madrasah.test', fullName: 'Super Admin', passwordHash, role: Role.SUPER_ADMIN },
  });

  const guru1 = await prisma.user.upsert({
    where: { email: 'guru.fiqh@madrasah.test' },
    update: {},
    create: { email: 'guru.fiqh@madrasah.test', fullName: 'Ustadz Ahmad Fauzi', passwordHash, role: Role.GURU },
  });

  const guru2 = await prisma.user.upsert({
    where: { email: 'guru.quran@madrasah.test' },
    update: {},
    create: { email: 'guru.quran@madrasah.test', fullName: 'Ustadzah Siti Aminah', passwordHash, role: Role.GURU },
  });

  await prisma.user.upsert({
    where: { email: 'pengawas@madrasah.test' },
    update: {},
    create: { email: 'pengawas@madrasah.test', fullName: 'Pengawas Ujian', passwordHash, role: Role.PENGAWAS },
  });

  // ─── Kelas ───────────────────────────────────────────────────────────────────
  const kelasXA = await prisma.class.upsert({
    where: { name_academicYear: { name: 'X-A', academicYear: '2025/2026' } },
    update: {},
    create: { name: 'X-A', academicYear: '2025/2026' },
  });

  const kelasXB = await prisma.class.upsert({
    where: { name_academicYear: { name: 'X-B', academicYear: '2025/2026' } },
    update: {},
    create: { name: 'X-B', academicYear: '2025/2026' },
  });

  const kelasXIA = await prisma.class.upsert({
    where: { name_academicYear: { name: 'XI-A', academicYear: '2025/2026' } },
    update: {},
    create: { name: 'XI-A', academicYear: '2025/2026' },
  });

  // ─── Santri ──────────────────────────────────────────────────────────────────
  const santriData = [
    { nis: '20250001', fullName: 'Ahmad Fauzi', classId: kelasXA.id },
    { nis: '20250002', fullName: 'Zainal Arifin', classId: kelasXA.id },
    { nis: '20250003', fullName: 'Siti Maryam', classId: kelasXA.id },
    { nis: '20250004', fullName: 'Umar Bakri', classId: kelasXB.id },
    { nis: '20250005', fullName: 'Laila Hasanah', classId: kelasXB.id },
    { nis: '20250006', fullName: 'Muhammad Rizki', classId: kelasXB.id },
    { nis: '20250007', fullName: 'Fatimah Zahra', classId: kelasXIA.id },
    { nis: '20250008', fullName: 'Abdullah Karim', classId: kelasXIA.id },
  ];

  const santriUsers = await Promise.all(
    santriData.map((s) =>
      prisma.user.upsert({
        where: { nis: s.nis },
        update: {},
        create: { nis: s.nis, fullName: s.fullName, passwordHash, role: Role.SANTRI, classId: s.classId },
      }),
    ),
  );

  // ─── Mata Pelajaran ──────────────────────────────────────────────────────────
  const fiqh = await prisma.subject.upsert({
    where: { name: 'Fiqh & Syariah' },
    update: {},
    create: { name: 'Fiqh & Syariah', description: 'Hukum Islam dan syariah dalam kehidupan sehari-hari' },
  });

  const quran = await prisma.subject.upsert({
    where: { name: 'Al-Quran & Hadits' },
    update: {},
    create: { name: 'Al-Quran & Hadits', description: 'Ilmu Al-Quran, tajwid, dan hadits Nabi SAW' },
  });

  const aqidah = await prisma.subject.upsert({
    where: { name: 'Aqidah Akhlak' },
    update: {},
    create: { name: 'Aqidah Akhlak', description: 'Tauhid, aqidah Islam, dan akhlak mulia' },
  });

  // ─── Assign Guru ke Mapel ────────────────────────────────────────────────────
  await prisma.userSubject.upsert({
    where: { userId_subjectId: { userId: guru1.id, subjectId: fiqh.id } },
    update: {},
    create: { userId: guru1.id, subjectId: fiqh.id },
  });
  await prisma.userSubject.upsert({
    where: { userId_subjectId: { userId: guru1.id, subjectId: aqidah.id } },
    update: {},
    create: { userId: guru1.id, subjectId: aqidah.id },
  });
  await prisma.userSubject.upsert({
    where: { userId_subjectId: { userId: guru2.id, subjectId: quran.id } },
    update: {},
    create: { userId: guru2.id, subjectId: quran.id },
  });

  // ─── Soal Fiqh (MC + Essay) ─────────────────────────────────────────────────
  const fiqhQuestions = await Promise.all([
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.EASY,
        text: 'Apa yang dimaksud dengan akad dalam fiqh muamalah?',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Ikatan perjanjian antara dua pihak yang menimbulkan hak dan kewajiban', isCorrect: true, order: 0 },
            { label: 'B', text: 'Pemberian hadiah tanpa syarat apapun', isCorrect: false, order: 1 },
            { label: 'C', text: 'Transaksi jual beli secara tunai saja', isCorrect: false, order: 2 },
            { label: 'D', text: 'Pinjaman uang dengan bunga', isCorrect: false, order: 3 },
            { label: 'E', text: 'Sewa menyewa barang tidak bergerak', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.MEDIUM,
        text: 'Perbedaan mendasar antara Wadi\'ah Yad Amanah dan Wadi\'ah Yad Dhamanah adalah...',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Amanah hanya untuk barang bergerak, Dhamanah untuk aset tetap', isCorrect: false, order: 0 },
            { label: 'B', text: 'Pada Yad Amanah penerima titipan tidak boleh memanfaatkan barang, Yad Dhamanah diperbolehkan dengan tanggung jawab penuh', isCorrect: true, order: 1 },
            { label: 'C', text: 'Yad Amanah memerlukan saksi, Yad Dhamanah tidak memerlukan dokumentasi', isCorrect: false, order: 2 },
            { label: 'D', text: 'Yad Dhamanah hanya berlaku di institusi perbankan syariah', isCorrect: false, order: 3 },
            { label: 'E', text: 'Tidak ada perbedaan dalam hal tanggung jawab', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.MEDIUM,
        text: 'Syarat sah jual beli menurut jumhur ulama meliputi...',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Penjual dan pembeli harus beragama Islam', isCorrect: false, order: 0 },
            { label: 'B', text: 'Adanya ijab kabul, penjual-pembeli berakal, dan barang halal', isCorrect: true, order: 1 },
            { label: 'C', text: 'Transaksi harus dilakukan secara tertulis', isCorrect: false, order: 2 },
            { label: 'D', text: 'Harus disaksikan oleh minimal dua orang', isCorrect: false, order: 3 },
            { label: 'E', text: 'Barang harus diserahkan seketika itu juga', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.HARD,
        text: 'Dalam konteks zakat maal, nisab emas yang menjadi batasan wajib zakat adalah...',
        score: 10,
        options: {
          create: [
            { label: 'A', text: '50 gram', isCorrect: false, order: 0 },
            { label: 'B', text: '75 gram', isCorrect: false, order: 1 },
            { label: 'C', text: '85 gram', isCorrect: true, order: 2 },
            { label: 'D', text: '100 gram', isCorrect: false, order: 3 },
            { label: 'E', text: '120 gram', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.EASY,
        text: 'Hukum riba dalam Islam adalah...',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Makruh', isCorrect: false, order: 0 },
            { label: 'B', text: 'Mubah jika dalam keadaan darurat', isCorrect: false, order: 1 },
            { label: 'C', text: 'Haram secara mutlak', isCorrect: true, order: 2 },
            { label: 'D', text: 'Halal jika dengan persetujuan kedua pihak', isCorrect: false, order: 3 },
            { label: 'E', text: 'Diperbolehkan untuk non-Muslim', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.ESSAY,
        difficulty: Difficulty.HARD,
        text: 'Jelaskan perbedaan antara murabahah dan musyarakah dalam perbankan syariah, serta berikan contoh penerapannya dalam kehidupan sehari-hari!',
        score: 20,
      },
    }),
    prisma.question.create({
      data: {
        subjectId: fiqh.id,
        type: QuestionType.ESSAY,
        difficulty: Difficulty.MEDIUM,
        text: 'Apa yang dimaksud dengan zakat fitrah? Siapa yang wajib membayarnya dan kapan batas waktu pembayarannya?',
        score: 15,
      },
    }),
  ]);

  // ─── Soal Quran & Hadits ─────────────────────────────────────────────────────
  const quranQuestions = await Promise.all([
    prisma.question.create({
      data: {
        subjectId: quran.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.EASY,
        text: 'Surah Al-Fatihah terdiri dari berapa ayat?',
        score: 5,
        options: {
          create: [
            { label: 'A', text: '5 ayat', isCorrect: false, order: 0 },
            { label: 'B', text: '6 ayat', isCorrect: false, order: 1 },
            { label: 'C', text: '7 ayat', isCorrect: true, order: 2 },
            { label: 'D', text: '8 ayat', isCorrect: false, order: 3 },
            { label: 'E', text: '9 ayat', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: quran.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.MEDIUM,
        text: 'Hukum tajwid yang berlaku ketika nun sukun bertemu dengan huruf ba\' adalah...',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Idgham bighunnah', isCorrect: false, order: 0 },
            { label: 'B', text: 'Ikhfa\'', isCorrect: false, order: 1 },
            { label: 'C', text: 'Iqlab', isCorrect: true, order: 2 },
            { label: 'D', text: 'Izhar halqi', isCorrect: false, order: 3 },
            { label: 'E', text: 'Idgham bilaghunnah', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: quran.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.HARD,
        text: 'Al-Quran diturunkan dalam berapa malam menurut riwayat yang paling masyhur?',
        score: 10,
        options: {
          create: [
            { label: 'A', text: '17 malam', isCorrect: false, order: 0 },
            { label: 'B', text: '21 malam', isCorrect: false, order: 1 },
            { label: 'C', text: '23 malam', isCorrect: false, order: 2 },
            { label: 'D', text: 'Berangsur selama 23 tahun', isCorrect: true, order: 3 },
            { label: 'E', text: '40 malam', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: quran.id,
        type: QuestionType.ESSAY,
        difficulty: Difficulty.MEDIUM,
        text: 'Jelaskan apa yang dimaksud dengan hadits mutawatir dan hadits ahad, serta perbedaan tingkat kehujjahannya!',
        score: 20,
      },
    }),
  ]);

  // ─── Soal Aqidah ─────────────────────────────────────────────────────────────
  const aqidahQuestions = await Promise.all([
    prisma.question.create({
      data: {
        subjectId: aqidah.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.EASY,
        text: 'Rukun iman yang pertama adalah...',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Iman kepada Malaikat', isCorrect: false, order: 0 },
            { label: 'B', text: 'Iman kepada Allah SWT', isCorrect: true, order: 1 },
            { label: 'C', text: 'Iman kepada Rasul', isCorrect: false, order: 2 },
            { label: 'D', text: 'Iman kepada Kitab', isCorrect: false, order: 3 },
            { label: 'E', text: 'Iman kepada Hari Akhir', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        subjectId: aqidah.id,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: Difficulty.MEDIUM,
        text: 'Sifat wajib Allah yang berarti bahwa Allah ada tanpa permulaan adalah...',
        score: 5,
        options: {
          create: [
            { label: 'A', text: 'Baqa\'', isCorrect: false, order: 0 },
            { label: 'B', text: 'Wahdaniyyah', isCorrect: false, order: 1 },
            { label: 'C', text: 'Qidam', isCorrect: true, order: 2 },
            { label: 'D', text: 'Wujud', isCorrect: false, order: 3 },
            { label: 'E', text: 'Mukhalafatu lil hawadits', isCorrect: false, order: 4 },
          ],
        },
      },
    }),
  ]);

  // ─── Ujian ────────────────────────────────────────────────────────────────────
  const ujianFiqhUTS = await prisma.exam.create({
    data: {
      title: 'UTS Fiqh & Syariah Kelas X',
      subjectId: fiqh.id,
      token: token('FQH', 'UTS1', 'X26'),
      status: ExamStatus.FINISHED,
      duration: 90,
      shuffleQ: true,
      shuffleOpts: false,
      startTime: new Date('2026-04-10T08:00:00Z'),
      endTime: new Date('2026-04-10T09:30:00Z'),
      items: {
        create: fiqhQuestions.map((q, i) => ({ questionId: q.id, order: i })),
      },
    },
  });

  const ujianQuranPTS = await prisma.exam.create({
    data: {
      title: 'PTS Al-Quran & Hadits Kelas X',
      subjectId: quran.id,
      token: token('QRN', 'PTS1', 'X26'),
      status: ExamStatus.PUBLISHED,
      duration: 60,
      shuffleQ: false,
      shuffleOpts: false,
      items: {
        create: quranQuestions.map((q, i) => ({ questionId: q.id, order: i })),
      },
    },
  });

  await prisma.exam.create({
    data: {
      title: 'Latihan Aqidah Akhlak',
      subjectId: aqidah.id,
      token: token('AQD', 'LAT1', '001'),
      status: ExamStatus.DRAFT,
      duration: 45,
      items: {
        create: aqidahQuestions.map((q, i) => ({ questionId: q.id, order: i })),
      },
    },
  });

  // ─── Sesi Ujian + Jawaban (untuk UTS Fiqh yang sudah FINISHED) ───────────────
  const mcFiqhQuestions = fiqhQuestions.filter((q) => q.type === QuestionType.MULTIPLE_CHOICE);

  // Ambil options untuk tiap soal MC
  const optionsMap = new Map<string, { id: string; isCorrect: boolean }[]>();
  for (const q of mcFiqhQuestions) {
    const opts = await prisma.questionOption.findMany({ where: { questionId: q.id } });
    optionsMap.set(q.id, opts);
  }

  const sessionResults = [
    { santri: santriUsers[0], score: 88, violations: 0 },
    { santri: santriUsers[1], score: 76, violations: 1 },
    { santri: santriUsers[2], score: 92, violations: 0 },
    { santri: santriUsers[3], score: 64, violations: 3 },
    { santri: santriUsers[4], score: 70, violations: 2 },
    { santri: santriUsers[5], score: 55, violations: 0 },
  ];

  for (const { santri, score, violations } of sessionResults) {
    const existingSession = await prisma.examSession.findUnique({
      where: { examId_userId: { examId: ujianFiqhUTS.id, userId: santri.id } },
    });
    if (existingSession) continue;

    const session = await prisma.examSession.create({
      data: {
        examId: ujianFiqhUTS.id,
        userId: santri.id,
        status: SessionStatus.SUBMITTED,
        startedAt: new Date('2026-04-10T08:05:00Z'),
        submittedAt: new Date('2026-04-10T09:20:00Z'),
        score,
        violationCount: violations,
        violations: violations > 0 ? Array.from({ length: violations }, (_, i) => ({
          type: i % 2 === 0 ? 'TAB_SWITCH' : 'FULLSCREEN_EXIT',
          at: new Date('2026-04-10T08:30:00Z').toISOString(),
        })) : [],
      },
    });

    // Jawab soal MC — simulasikan beberapa salah sesuai score
    const correctThreshold = score / 100;
    for (const q of mcFiqhQuestions) {
      const opts = optionsMap.get(q.id) ?? [];
      const correctOpt = opts.find((o) => o.isCorrect);
      const wrongOpts = opts.filter((o) => !o.isCorrect);
      const answeredCorrectly = Math.random() < correctThreshold;
      const chosenOpt = answeredCorrectly ? correctOpt : wrongOpts[0];

      if (!chosenOpt) continue;

      await prisma.answer.create({
        data: {
          sessionId: session.id,
          questionId: q.id,
          userId: santri.id,
          optionId: chosenOpt.id,
          isCorrect: chosenOpt.isCorrect,
          score: chosenOpt.isCorrect ? q.score : 0,
        },
      });
    }

    // Jawaban esai (belum dinilai)
    const essayFiqhQuestions = fiqhQuestions.filter((q) => q.type === QuestionType.ESSAY);
    for (const q of essayFiqhQuestions) {
      await prisma.answer.create({
        data: {
          sessionId: session.id,
          questionId: q.id,
          userId: santri.id,
          essayText: 'Murabahah adalah akad jual beli di mana penjual menyebutkan harga pokok dan keuntungan secara transparan kepada pembeli. Sedangkan musyarakah adalah akad kerjasama antara dua pihak atau lebih dimana masing-masing memberikan kontribusi dana atau keahlian untuk mengelola usaha bersama.',
        },
      });
    }
  }

  // ─── AuditLog sample ─────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'USER_CREATE', resource: 'user:*', metadata: { role: 'SANTRI' } },
      { userId: guru1.id, action: 'EXAM_CREATE', resource: `exam:${ujianFiqhUTS.id}`, metadata: { title: ujianFiqhUTS.title } },
    ],
    skipDuplicates: true,
  });

  console.log('');
  console.log('✅ Seed selesai!');
  console.log('');
  console.log('─── Akun Login ─────────────────────────────────────');
  console.log('  SUPER_ADMIN : admin@madrasah.test       / password123');
  console.log('  GURU        : guru.fiqh@madrasah.test   / password123');
  console.log('  PENGAWAS    : pengawas@madrasah.test    / password123');
  console.log('  SANTRI      : NIS 20250001 - 20250008   / password123');
  console.log('');
  console.log('─── Token Ujian ─────────────────────────────────────');
  console.log(`  UTS Fiqh (FINISHED)  : FQH-UTS1-X26`);
  console.log(`  PTS Quran (PUBLISHED): QRN-PTS1-X26`);
  console.log(`  Latihan Aqidah (DRAFT): AQD-LAT1-001`);
  console.log('────────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
