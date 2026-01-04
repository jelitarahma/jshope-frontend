'use client';

import { useEffect, useState } from 'react';

export default function AdminHeader({ title }: { title: string }) {
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

  return (
    <header className="bg-white border-b border-stone-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">{title}</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-stone-700 hidden md:block">
              {username}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
