'use client'

import { useFollow } from '@/hooks/useFollow'
import { IconUserPlus, IconUserMinus } from '@tabler/icons-react'

interface FollowButtonProps {
  userId: string
  currentUserId: string | null
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onFollowChange?: () => void
}

export default function FollowButton({ 
  userId, 
  currentUserId, 
  className = '',
  variant = 'outline',
  size = 'sm',
  onFollowChange
}: FollowButtonProps) {
  const { isFollowing, isLoading, toggleFollow } = useFollow(userId, currentUserId, onFollowChange)

  // Don't show button if user is viewing their own profile
  if (currentUserId === userId) {
    return null
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8'
    }
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground'
    }
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={getButtonClasses()}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <IconUserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <IconUserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </button>
  )
} 