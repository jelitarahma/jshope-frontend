'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface UserData {
  username?: string;
  email?: string;
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role');
      const savedUser = localStorage.getItem('user');

      if (token && savedRole) {
        setIsLoggedIn(true);
        setRole(savedRole);

        if (savedUser) {
          try {
            const user: UserData = JSON.parse(savedUser);
            setUsername(user.username || user.email?.split('@')[0] || 'User');
          } catch {
            setUsername('User');
          }
        }
      } else {
        setIsLoggedIn(false);
        setRole(null);
        setUsername('');
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuth]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setRole(null);
    setUsername('');
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  if (pathname?.startsWith('/auth') || pathname?.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ];

  const userInitial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-300 border-b
        ${isScrolled
          ? 'bg-white shadow-md border-gray-200'
          : 'bg-white/95 border-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">JS</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-800">JShope</span>
              <span className="block text-[10px] text-gray-500 -mt-1">by Jelita Rahma</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative font-medium text-sm py-2 transition-colors
                  ${pathname === link.href
                    ? 'text-amber-600 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-500 after:rounded-full'
                    : 'text-gray-700 hover:text-amber-600'}
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {role !== 'admin' && (
                  <Link
                    href="/cart"
                    className={`
                      relative p-2 rounded-full transition-colors
                      ${pathname === '/cart'
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-gray-700 hover:bg-gray-100'}
                    `}
                    title="Keranjang"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold shadow-md">
                      {userInitial}
                    </div>
                    <span className="font-medium text-gray-800 max-w-[140px] truncate hidden lg:block">
                      {username}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                      <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Masuk sebagai</p>
                        <p className="font-semibold text-gray-900 truncate">{username}</p>
                      </div>

                      <Link
                        href="/clientArea/orders"
                        className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Pesanan Saya
                      </Link>

                      <div className="h-px bg-gray-100 my-2 mx-4" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth?mode=login"
                  className="text-gray-700 font-medium hover:text-amber-600 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-full hover:brightness-110 transition shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-5 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-3 rounded-lg font-medium
                  ${pathname === link.href
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                {role !== 'admin' && (
                  <Link
                    href="/cart"
                    className={`
                      px-4 py-3 rounded-lg font-medium flex items-center gap-3
                      ${pathname === '/cart' ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Keranjang
                  </Link>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{username}</p>
                    <p className="text-xs text-gray-500">Masuk sebagai pelanggan</p>
                  </div>

                  <Link
                    href="/clientArea/orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Pesanan Saya
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-3 mx-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition text-left flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout now
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 px-2">
                <Link
                  href="/auth?mode=login"
                  className="flex-1 py-3 text-center border border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Masuk
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="flex-1 py-3 text-center bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}