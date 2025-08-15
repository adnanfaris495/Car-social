'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { IconCar, IconCarGarage, IconShoppingBag, IconMessageCircle, IconCalendarEvent, IconUser, IconSun, IconMoon, IconSearch } from '@tabler/icons-react'
import { useSession } from '@supabase/auth-helpers-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const navItems = [
  { name: 'Home', href: '/', icon: IconCar },
  { name: 'Garage', href: '/garage', icon: IconCarGarage },
  { name: 'Marketplace', href: '/marketplace', icon: IconShoppingBag },
  { name: 'Forums', href: '/forums', icon: IconMessageCircle },
  { name: 'Meets', href: '/meets', icon: IconCalendarEvent },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const session = useSession();
  const user = session?.user;
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Debug session state
  console.log('NAV: session', session, 'user', user);

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('NAV: Current session from getSession:', currentSession);
        setIsLoading(false);
      } catch (error) {
        console.error('NAV: Error getting session:', error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or implement search functionality
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card-background/95 backdrop-blur-md border-r border-card-border z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-card-border">
          <Link href="/" className="hover:opacity-90 transition-opacity duration-200">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-card-border shadow-sm min-w-0 bg-card-background">
              <span className="font-bold tracking-wide whitespace-nowrap text-lg relative z-10 text-foreground">
                CARSOCIAL
              </span>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-card-border">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <IconSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search users and cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card-background border border-card-border rounded-xl text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all duration-200"
              />
            </div>
          </form>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' 
                      : 'text-foreground hover:bg-card-background/50 hover:text-accent-primary'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-card-border">
          {!isLoading && user ? (
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-foreground hover:bg-card-background/50 hover:text-accent-primary w-full"
            >
              <IconUser size={24} />
              <span className="font-medium">Profile</span>
            </button>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-foreground hover:bg-card-background/50 hover:text-accent-primary"
            >
              <IconUser size={24} />
              <span className="font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 