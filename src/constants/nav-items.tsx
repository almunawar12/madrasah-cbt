import {
  LayoutDashboard,
  BookOpen,
  Timer,
  Users,
  Settings,
  HelpCircle,
  ShieldCheck,
  FileText,
  BarChart3,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import type { NavItem } from '@/components/organisms/sidebar';
import type { Role } from '@/constants/roles';

const iconClass = 'w-5 h-5';

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  SUPER_ADMIN: [
    { href: '/super-admin', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { href: '/super-admin/users', label: 'Pengguna', icon: <Users className={iconClass} /> },
    { href: '/super-admin/classes', label: 'Kelas', icon: <GraduationCap className={iconClass} /> },
    { href: '/super-admin/subjects', label: 'Mata Pelajaran', icon: <BookOpen className={iconClass} /> },
    { href: '/super-admin/questions', label: 'Bank Soal', icon: <FileText className={iconClass} /> },
    { href: '/super-admin/exams', label: 'Ujian', icon: <Timer className={iconClass} /> },
    { href: '/super-admin/reports', label: 'Laporan', icon: <BarChart3 className={iconClass} /> },
    { href: '/super-admin/settings', label: 'Pengaturan', icon: <Settings className={iconClass} /> },
  ],
  GURU: [
    { href: '/guru', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { href: '/guru/questions', label: 'Bank Soal', icon: <BookOpen className={iconClass} /> },
    { href: '/guru/exams', label: 'Ujian Saya', icon: <Timer className={iconClass} /> },
    { href: '/guru/grading', label: 'Penilaian', icon: <FileText className={iconClass} /> },
    { href: '/guru/reports', label: 'Laporan', icon: <BarChart3 className={iconClass} /> },
  ],
  PENGAWAS: [
    { href: '/pengawas', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { href: '/pengawas/monitoring', label: 'Monitoring', icon: <ShieldCheck className={iconClass} /> },
    { href: '/pengawas/violations', label: 'Pelanggaran', icon: <AlertTriangle className={iconClass} /> },
  ],
  SANTRI: [
    { href: '/santri', label: 'Dashboard', icon: <LayoutDashboard className={iconClass} /> },
    { href: '/santri/exams', label: 'Ujian Saya', icon: <Timer className={iconClass} /> },
    { href: '/santri/results', label: 'Hasil Ujian', icon: <BarChart3 className={iconClass} /> },
  ],
};
