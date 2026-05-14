export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern p-4 md:p-0">
      {children}
    </div>
  );
}
