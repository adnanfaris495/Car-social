import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppProviders from '@/components/AppProviders';
import LayoutWithNav from '@/components/LayoutWithNav';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wheels - Car Social Media',
  description: 'A social media platform for car enthusiasts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} theme-transition`}>
        <AppProviders>
          <LayoutWithNav>{children}</LayoutWithNav>
        </AppProviders>
      </body>
    </html>
  );
} 