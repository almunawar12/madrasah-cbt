import { Metadata } from 'next';
import { ExamsClient } from './_components/exams-client';

export const metadata: Metadata = { title: 'Ujian · SantriExam' };

export default function ExamsPage() {
  return <ExamsClient />;
}
