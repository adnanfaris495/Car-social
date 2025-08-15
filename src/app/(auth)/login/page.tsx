'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
  const router = useRouter()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handleModeSwitch = (newMode: 'signin' | 'register') => setMode(newMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        // Check if input is email or username
        const isEmail = email.includes('@');
        
        if (isEmail) {
          // Sign in with email
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (data?.session) {
            console.log('Email login successful, session:', data.session);
            window.location.href = '/';
          }
          if (error) setError(error.message);
        } else {
          // Sign in with username using our API route
          const response = await fetch('/api/auth/username-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: email, password }),
          });

          const result = await response.json();
          console.log('Username login response:', result);

          if (response.ok && result.success) {
            console.log('Username login successful, redirecting...');
            
            // Force a page refresh to ensure session is properly loaded
            setTimeout(() => {
              console.log('Redirecting to home...');
              window.location.href = '/';
            }, 500);
          } else {
            // Show the specific error message from the API
            setError(result.error || 'Invalid username or password');
          }
        }
      } else {
        if (username.length < 3) throw new Error('Username must be at least 3 characters long');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long');
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        setShowConfirmationMessage(true);
        setTimeout(() => {
          setShowConfirmationMessage(false);
          setMode('signin');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
    }}>
      {/* Ferrari Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 800\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23dc2626;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23b91c1c;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grad)\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-black/40 to-red-800/20" />
        
        {/* Subtle car pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-red-500/30 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-red-500/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-red-500/25 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 border border-red-500/15 rounded-full"></div>
        </div>
      </div>

      {/* Headline and subheadline */}
      <div className="z-10 flex flex-col items-center mb-8 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          CarSocial
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl md:text-2xl font-medium max-w-2xl">
          Where Car Enthusiasts Connect
        </p>
        <p className="text-gray-400 text-base sm:text-lg mt-2 max-w-xl">
          Join a global garage. Show off your ride. Buy, sell, and meet up.
        </p>
      </div>

      {/* Login/Register Card */}
      <div className="z-10 w-full max-w-md bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-2 border border-red-500/30">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
          {mode === 'signin' ? 'Sign In to CarSocial' : 'Create your account'}
        </h2>
        {showConfirmationMessage ? (
          <div className="w-full text-center text-white bg-green-600 rounded-lg py-3 px-4 mb-4 font-semibold">
            Check your email for a confirmation link!
          </div>
        ) : (
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label htmlFor="username" className="block text-white font-semibold mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                  onChange={handleUsernameChange}
                  autoComplete="username"
                  required
                  placeholder="Your username"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-white font-semibold mb-2">Username or Email</label>
              <input
                id="email"
                type="text"
                value={email}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
                onChange={handleEmailChange}
                autoComplete="username"
                required
                placeholder="Enter your username or email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-white font-semibold mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
              {mode === 'signin' && (
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>
            {error && (
              <div className="w-full text-center text-white bg-red-600 rounded-lg py-3 px-4 font-semibold">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => handleModeSwitch(mode === 'signin' ? 'register' : 'signin')}
            className="text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
} 