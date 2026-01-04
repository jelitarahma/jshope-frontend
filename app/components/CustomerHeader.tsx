'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryService, Category } from '@/lib/services/categoryService';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  greenBg: '#E8F5E9',
  cream: '#FAFAF5',
};

export default function CustomerHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUsername(userData.username || 'User');
      } catch {
        setUsername('User');
      }
    }

    const fetchCategories = async () => {
      try {
        const cats = await categoryService.getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <>
      <div style={{ backgroundColor: COLORS.primary }} className="py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-white text-sm">
            <p className="text-center sm:text-left flex items-center mb-0">
              ✨ <span className="font-medium ml-1">Free Shipping</span> <span className="ml-1">on orders over Rp 500.000</span>
            </p>
          </div>
        </div>
      </div>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/assets/brand-bnw.png"
                  alt="Brand"
                  width={120}
                  height={40}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-green-50"
                  style={{ color: COLORS.primary }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">All Categories</span>
                  <svg className={`w-4 h-4 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCategoryMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="py-2">
                      {categories.length > 0 ? (
                        categories.map((category, index) => (
                          <Link
                            key={category._id}
                            href={`/products?category=${category._id}`}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                            onClick={() => setShowCategoryMenu(false)}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }}></div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500 text-center">No categories available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/cart"
                    className="relative p-2 rounded-full transition-colors hover:bg-green-50 text-gray-700"
                    title="Cart"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </Link>

                  <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 hover:bg-green-50 py-1 px-2 rounded-lg transition-colors focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate hidden sm:block">
                            {username}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right">
                             <div className="px-4 py-2 border-b border-gray-100 mb-1 lg:hidden">
                                <p className="text-xs text-gray-500">Signed in as</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{username}</p>
                             </div>
                            
                            <Link 
                                href="/clientArea/orders" 
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors mx-1 rounded-lg"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                Pesanan Saya
                            </Link>

                            <div className="h-px bg-gray-100 my-1 mx-2" />
                            
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mx-1 rounded-lg text-left"
                            >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Logout
                            </button>
                        </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth?mode=login"
                    className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: COLORS.primary }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
