import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import { WebVitals } from '@/components/ui';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: {
    default: 'ToolChest - Utility Tools for Common Tasks',
    template: '%s | ToolChest'
  },
  description: 'A collection of useful utility tools for common tasks including Base64 encoding/decoding, hash generation, favicon creation, and more.',
  keywords: ['tools', 'utilities', 'base64', 'hash', 'favicon', 'markdown', 'pdf', 'converter'],
  authors: [{ name: 'ToolChest' }],
  creator: 'ToolChest',
  publisher: 'ToolChest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ToolChest - Utility Tools for Common Tasks',
    description: 'A collection of useful utility tools for common tasks including Base64 encoding/decoding, hash generation, favicon creation, and more.',
    siteName: 'ToolChest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolChest - Utility Tools for Common Tasks',
    description: 'A collection of useful utility tools for common tasks including Base64 encoding/decoding, hash generation, favicon creation, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 font-sans antialiased">
        <WebVitals debug={process.env.NODE_ENV === 'development'} />
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <Footer />
      </body>
    </html>
  );
}
