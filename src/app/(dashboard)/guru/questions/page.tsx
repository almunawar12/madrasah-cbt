import { Metadata } from 'next';
import { QuestionsClient } from './_components/questions-client';

export const metadata: Metadata = { title: 'Bank Soal · SantriExam' };

export default function QuestionsPage() {
  return <QuestionsClient />;
}
