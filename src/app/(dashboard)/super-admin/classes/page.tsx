import { Metadata } from 'next';
import { ClassesClient } from './_components/classes-client';

export const metadata: Metadata = { title: 'Manajemen Kelas · SantriExam' };

export default function ClassesPage() {
  return <ClassesClient />;
}
