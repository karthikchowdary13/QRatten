import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import OfflineSync from '@/components/OfflineSync';
import InteractiveBackground from '@/components/InteractiveBackground';
import PrismBackground from '@/components/PrismBackground';
import SmoothScroll from '@/components/SmoothScroll';
import { ThemeProvider } from '@/components/theme-provider';
import CustomCursor from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: 'QRatten',
  description: 'Smart Attendance, Powered by QR.',
  icons: {
    icon: [
      { url: '/qratten-logos/favicon1.png', sizes: '32x32', type: 'image/png' },
      { url: '/qratten-logos/favicon1.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/qratten-logos/favicon1.png',
    apple: '/qratten-logos/logo-mobile.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/qratten-logos/favicon1.png" />
        <link rel="shortcut icon" href="/qratten-logos/favicon1.png" />
        <link rel="apple-touch-icon" href="/qratten-logos/logo-mobile.png" />
      </head>
      <body suppressHydrationWarning className="min-h-screen relative" style={{ background: '#f4f6fa', minHeight: '100vh' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ToastProvider>
            {/* Content layer */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <SmoothScroll>
                {children}
                <CustomCursor />
                <OfflineSync />
              </SmoothScroll>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
