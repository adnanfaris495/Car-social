import { IconLoader2 } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'white'
  className?: string
  text?: string
  showText?: boolean
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text = 'Loading...',
  showText = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'text-muted-foreground',
    primary: 'text-accent-primary',
    secondary: 'text-accent-secondary',
    white: 'text-white'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <IconLoader2
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {showText && (
          <p className={cn('text-sm', variantClasses[variant])}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// Convenience components for common use cases
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="xl" text="Loading page..." showText />
    </div>
  )
}

export function CardLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function ButtonLoader() {
  return <LoadingSpinner size="sm" variant="white" />
}

export function InlineLoader() {
  return <LoadingSpinner size="sm" />
} 