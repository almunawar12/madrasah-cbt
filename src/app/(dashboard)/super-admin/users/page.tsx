import { Metadata } from 'next';
import { UsersClient } from './_components/users-client';

export const metadata: Metadata = { title: 'User Management · SantriExam' };

export default function UsersPage() {
  return <UsersClient />;
}
