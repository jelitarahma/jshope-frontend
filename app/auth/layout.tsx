// app/auth/layout.tsx - Auth Layout (no navbar/footer)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
