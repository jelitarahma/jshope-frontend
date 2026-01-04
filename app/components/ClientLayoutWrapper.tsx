'use client';

import { usePathname } from 'next/navigation';
import CustomerHeader from './CustomerHeader';
import Footer from './customer/Footer';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminAttributes = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminAttributes && !pathname?.startsWith('/auth') && <CustomerHeader />}
      <main className="flex-1">{children}</main>
      {!isAdminAttributes && !pathname?.startsWith('/auth') && <Footer />}
    </>
  );
}
