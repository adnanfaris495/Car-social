'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'register'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
  
  const { signIn, signUp } = useAuth()

  // Reset form when modal is opened/closed or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
    setEmail('')
    setPassword('')
    setUsername('')
    setError('')
    setIsLoading(false)
    setShowConfirmationMessage(false)
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
        onClose()
      } else {
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters long')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        await signUp(email, password, username)
        setShowConfirmationMessage(true)
        setTimeout(() => {
          setShowConfirmationMessage(false)
          onClose()
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'register' : 'signin')
    setError('')
    setShowConfirmationMessage(false)
  }

  const handleClose = () => {
    setError('')
    setIsLoading(false)
    setShowConfirmationMessage(false)
    onClose()
  }

  if (showConfirmationMessage) {
    return (
      <div className="modal-overlay">
        <div className="modal-content w-full max-w-md">
          <h2 className="section-heading mb-4">Check Your Email</h2>
          <p className="text-muted mb-6">
            We've sent a confirmation link to <strong className="text-foreground">{email}</strong>. Please check your email and click the link to activate your account.
          </p>
          <div className="text-muted text-sm mb-6">
            <p>Make sure to:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Check your spam folder if you don't see the email</li>
              <li>Click the confirmation link in the email</li>
              <li>Return here to sign in after confirming</li>
            </ul>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setShowConfirmationMessage(false)}
              className="text-muted hover:text-foreground transition-colors"
            >
              Back to registration
            </button>
            <button
              onClick={() => {
                setMode('signin')
                setShowConfirmationMessage(false)
              }}
              className="button-primary"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-md relative">
                    <h2 className="section-heading mb-6 racing-font">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-accent-secondary/10 border border-accent-secondary text-accent-secondary px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
                minLength={3}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center text-sm text-muted">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-accent-secondary hover:text-accent-secondary/80 transition-colors"
                  disabled={isLoading}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-accent-secondary hover:text-accent-secondary/80 transition-colors"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
} 