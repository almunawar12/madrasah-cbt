import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ROLE_PREFIX } from '@/constants/routes';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  redirect(ROLE_PREFIX[session.user.role]);
}
