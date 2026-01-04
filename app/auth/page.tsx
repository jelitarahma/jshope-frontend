'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import Swal from 'sweetalert2';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'register');
  }, [searchParams]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('customer');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(loginEmail, loginPassword);
      authService.saveAuth(res.token, res.user);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back!`,
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = res.user.role === 'admin' ? '/admin' : '/';
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.error || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(regUsername, regEmail, regPassword, regRole);

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Please login with your new account.',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => setIsLogin(true));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.error || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col lg:flex-row font-sans">
      
      <div className="w-full lg:w-[40%] p-3 lg:p-4 bg-white h-full hidden lg:block">
        <div className="w-full h-full rounded-3xl overflow-hidden relative">
             <img 
                src="https://i.pinimg.com/736x/61/0e/fe/610efe08df6df834292f0f70d343aa56.jpg" 
                alt="Auth Banner" 
                className="w-full h-full object-cover object-bottom"
             />
             <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between text-white">
                <div className="max-w-[80%] p-5">
                    <p className="font-medium font-thin mb-2 text-white">Shop Your Style</p>
                    <h2 className="opacity-90 text-white font-bold">
                        Discover the latest trends and essential products for your daily life.
                    </h2>
                </div>
             </div>
        </div>
      </div>

      <div className="lg:hidden w-full h-48 relative overflow-hidden flex-shrink-0">
          <img 
            src="https://i.pinimg.com/736x/61/0e/fe/610efe08df6df834292f0f70d343aa56.jpg" 
             alt="Mobile Banner" 
             className="w-full h-full object-cover object-bottom"
          />
      </div>

      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md">
            
            <div className="mb-3">
                <h2 className="text-3xl font-bold text-stone-900 mb-2">
                    {isLogin ? 'Create an account' : 'Create an account'}
                </h2>
                <div className="text-stone-500 text-sm py-2">
                   Access your account, cart, and products anytime, <br/> anywhere - and shop your style.
                </div>
            </div>

            {isLogin ? (
                 <form onSubmit={handleLogin} className="space-y-5">
                    <div className='pb-4'>
                        <label className="block text-sm font-bold text-stone-900 mb-2">Your email</label>
                        <input
                            type="email"
                            placeholder="username@gmail.com"
                            className="w-full px-4 py-3 rounded-lg border border-stone-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-stone-400 text-stone-600"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className='pb-4'>
                        <label className="block text-sm font-bold text-stone-900 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg border border-stone-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-stone-400 text-stone-600 tracking-widest"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transform active:scale-[0.98] duration-200 mt-2 mb-3"
                    >
                        {loading ? 'Logging in...' : 'Get Started'}
                    </button>
                    
                    <div className="my-8 relative flex items-center justify-center">
                         <div className="h-px bg-stone-200 w-full absolute"></div>
                         <span className="bg-white px-3 relative text-stone-400 text-xs uppercase tracking-wide">or continue with</span>
                    </div>

                    <div className="flex gap-4 justify-center py-3">
                         <button type="button" className="w-16 h-10 flex items-center justify-center rounded-full bg-stone-200 hover:bg-stone-300 transition-colors">
                              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                         </button>
                         <button type="button" className="w-16 h-10 flex items-center justify-center rounded-full bg-stone-200 hover:bg-stone-300 transition-colors">
                            <svg fill="currentColor" className="w-4 h-4 text-blue-800" viewBox="0 0 24 24"><path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path></svg>
                         </button>
                    </div>

                    <p className="text-center text-sm text-stone-500 pt-6">
                        Don&apos;t have an account? <button type="button" onClick={() => setIsLogin(false)} className="text-blue-600 font-semibold hover:underline">Sign up</button>
                    </p>
                 </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                     <div className="pb-4">
                        <label className="block text-sm font-semibold text-stone-900 mb-2">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-stone-400 text-stone-600"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                     <div className="pb-4">
                        <label className="block text-sm font-semibold text-stone-900 mb-2">Email address</label>
                        <input
                            type="email"
                            placeholder="workmail@gmail.com"
                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-stone-400 text-stone-600"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="pb-4">
                        <label className="block text-sm font-semibold text-stone-900 mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-stone-400 text-stone-600"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="pb-4">
                        <label className="block text-sm font-semibold text-stone-900 mb-2">Role</label>
                         <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white text-stone-600"
                            disabled={loading}
                        >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transform active:scale-[0.98] duration-200 mb-4"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <p className="text-center text-sm text-stone-500 pt-6">
                        Have an account? <button type="button" onClick={() => setIsLogin(true)} className="text-blue-600 font-semibold hover:underline">Log in</button>
                    </p>
                </form>
            )}

        </div>
      </div>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
