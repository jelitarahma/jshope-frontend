
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import brandBnW from "@/app/assets/images/brand-bnw.png";
import avatarJs from "@/app/assets/images/avatar-js.png";

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  accentLight: '#FDD835',
  bg: '#F5F5DC',
  bgLight: '#FAFAF5',
  greenBg: '#E8F5E9',
  text: '#1f2937',
  textMuted: '#6b7280',
};

const DashboardIcon = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1.5"/>
    <path d="M9 21V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V21" fill="#FFFDE7" stroke="#FDD835" strokeWidth="1.5"/>
    <circle cx="12" cy="8" r="1.5" fill="#F9A825"/>
  </svg>
);

const ProductIcon = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M20 7L12 3L4 7V17L12 21L20 17V7Z" fill={active ? "#C8E6C9" : "#E8F5E9"} stroke={active ? "#2E7D32" : "#4CAF50"} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 12L4 7M12 12L20 7M12 12V21" stroke={active ? "#2E7D32" : "#4CAF50"} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="2" fill={active ? "#F9A825" : "#FDD835"}/>
  </svg>
);

const CategoryIcon = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V8C10 9.10457 9.10457 10 8 10H6C4.89543 10 4 9.10457 4 8V6Z" fill={active ? "#C8E6C9" : "#E8F5E9"} stroke={active ? "#2E7D32" : "#4CAF50"} strokeWidth="1.5"/>
    <path d="M14 6C14 4.89543 14.8954 4 16 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H16C14.8954 10 14 9.10457 14 8V6Z" fill={active ? "#FFF9C4" : "#FFFDE7"} stroke={active ? "#F9A825" : "#FDD835"} strokeWidth="1.5"/>
    <path d="M4 16C4 14.8954 4.89543 14 6 14H8C9.10457 14 10 14.8954 10 16V18C10 19.1046 9.10457 20 8 20H6C4.89543 20 4 19.1046 4 18V16Z" fill={active ? "#FFF9C4" : "#FFFDE7"} stroke={active ? "#F9A825" : "#FDD835"} strokeWidth="1.5"/>
    <path d="M14 16C14 14.8954 14.8954 14 16 14H18C19.1046 14 20 14.8954 20 16V18C20 19.1046 19.1046 20 18 20H16C14.8954 20 14 19.1046 14 18V16Z" fill={active ? "#C8E6C9" : "#E8F5E9"} stroke={active ? "#2E7D32" : "#4CAF50"} strokeWidth="1.5"/>
  </svg>
);

const OrderIcon = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke={active ? "#2E7D32" : "#4CAF50"} strokeWidth="1.5"/>
    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" fill={active ? "#C8E6C9" : "#E8F5E9"} stroke={active ? "#2E7D32" : "#4CAF50"} strokeWidth="1.5"/>
    <path d="M9 12H15M9 16H13" stroke={active ? "#F9A825" : "#FDD835"} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="3" fill={active ? "#FFF9C4" : "#FFFDE7"} stroke={active ? "#F9A825" : "#FDD835"} strokeWidth="1"/>
  </svg>
);

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: DashboardIcon },
  { label: 'Products', href: '/admin/products', icon: ProductIcon },
  { label: 'Categories', href: '/admin/categories', icon: CategoryIcon },
  { label: 'Orders', href: '/admin/orders', icon: OrderIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsername(user.username || 'Admin');
      } catch {
        setUsername('Admin');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/auth?mode=login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white flex flex-col items-center shadow-lg z-50" style={{ borderRight: '1px solid #E8F5E9' }}>
      <div style={{ paddingTop: '20px', paddingBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', position: 'relative' }}>
          <Image 
            src={brandBnW} 
            alt="Brand" 
            fill
            style={{ objectFit: 'contain', transform: 'rotate(90deg)' }}
            priority
          />
        </div>
      </div>

      <div style={{ width: '40px', height: '1px', backgroundColor: '#E8F5E9', marginBottom: '16px' }} />

      <nav className="flex-1 flex flex-col items-center justify-center gap-3 w-full px-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group"
              style={{
                textDecoration: 'none',
                backgroundColor: active ? '#E8F5E9' : 'transparent',
                boxShadow: active ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                border: active ? '2px solid #4CAF50' : '2px solid transparent',
              }}
              title={item.label}
            >
              <IconComponent active={active} />
              {active && (
                <span 
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full" 
                  style={{ backgroundColor: COLORS.primary }}
                />
              )}
              <span 
                className="absolute left-full ml-4 px-3 py-2 text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg"
                style={{ textDecoration: 'none', backgroundColor: COLORS.primary }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div style={{ width: '40px', height: '1px', backgroundColor: '#E8F5E9', marginTop: '16px' }} />

      <div style={{ paddingTop: '16px', paddingBottom: '20px' }} className="group relative">
        <div 
          className="w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-105"
          style={{ borderColor: COLORS.greenBg }}
          onClick={handleLogout}
        >
          <Image 
            src={avatarJs} 
            alt="Admin" 
            width={48} 
            height={48}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div 
          className="absolute left-full ml-4 bottom-0 px-3 py-2 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg"
          style={{ border: `1px solid ${COLORS.greenBg}` }}
        >
          <p className="text-sm font-semibold" style={{ color: COLORS.primary, marginBottom: '2px' }}>
            {username}
          </p>
          <p className="text-xs" style={{ color: COLORS.textMuted, marginBottom: '4px' }}>
            Administrator
          </p>
          <p className="text-xs italic" style={{ color: COLORS.accent }}>
            Click to logout
          </p>
        </div>
      </div>
    </aside>
  );
}
