export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-background islamic-pattern">
      {children}
    </div>
  );
}
