'use client'

// import { useTheme } from '@/lib/theme'
import { IconSun, IconMoon } from '@tabler/icons-react'

export default function ThemeToggle() {
  // const { theme, toggleTheme, mounted } = useTheme()

  // Don't render until theme is mounted
  // if (!mounted) return null;

  return (
    <button
      className="p-2 rounded-xl bg-card-background border border-card-border text-foreground opacity-50 cursor-not-allowed"
      disabled
    >
      Theme
    </button>
  );
} 