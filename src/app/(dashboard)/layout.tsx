import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <DashboardLayout role={session.user.role} fullName={session.user.fullName}>
      {children}
    </DashboardLayout>
  );
}
