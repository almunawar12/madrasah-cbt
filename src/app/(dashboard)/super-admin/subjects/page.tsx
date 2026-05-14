import { Metadata } from 'next';
import { SubjectsClient } from './_components/subjects-client';

export const metadata: Metadata = { title: 'Mata Pelajaran · SantriExam' };

export default function SubjectsPage() {
  return <SubjectsClient />;
}
