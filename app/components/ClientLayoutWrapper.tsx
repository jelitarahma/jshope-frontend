'use client';

import { usePathname } from 'next/navigation';
import CustomerHeader from './CustomerHeader';
import Footer from './customer/Footer';
import { useEffect } from 'react';
import LogRocket from 'logrocket';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminAttributes = pathname?.startsWith('/admin');

  useEffect(() => {
    // Initialize LogRocket
    LogRocket.init('qawlmv/jshope');
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.email) {
            LogRocket.identify(user._id || user.email, {
                name: user.username,
                email: user.email,
                role: user.role
            });
        }
      } catch (e) {
        console.error("LogRocket identify failed", e);
      }
    }
  }, []);

  return (
    <>
      {!isAdminAttributes && !pathname?.startsWith('/auth') && <CustomerHeader />}
      <main className="flex-1">{children}</main>
      {!isAdminAttributes && !pathname?.startsWith('/auth') && <Footer />}
    </>
  );
}
