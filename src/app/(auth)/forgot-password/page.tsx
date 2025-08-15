'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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
          Reset Your Password
        </p>
        <p className="text-gray-400 text-base sm:text-lg mt-2 max-w-xl">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Forgot Password Card */}
      <div className="z-10 w-full max-w-md bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-2 border border-red-500/30">
        {success ? (
          <div className="w-full text-center">
            <div className="w-full text-center text-white bg-green-600 rounded-lg py-3 px-4 mb-6 font-semibold">
              Check your email for a password reset link!
            </div>
            <p className="text-gray-300 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in your email to reset your password.
            </p>
            <Link
              href="/login"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 inline-block text-center"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
              Forgot Your Password?
            </h2>
            <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                />
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
