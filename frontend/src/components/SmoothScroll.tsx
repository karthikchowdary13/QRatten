'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Disable smooth scroll on dashboard and admin pages to prevent interference with nested scroll container
  const isDashboard = 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/profile') || 
    pathname?.startsWith('/student') || 
    pathname?.startsWith('/hr') || 
    pathname?.startsWith('/parent');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
