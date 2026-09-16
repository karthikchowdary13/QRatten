'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Dashboard routes need to feel instant and snappy
  const isDashboard = 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/profile') || 
    pathname?.startsWith('/student') || 
    pathname?.startsWith('/hr') || 
    pathname?.startsWith('/parent');

  return (
    <motion.div
      initial={isDashboard ? { opacity: 0 } : { opacity: 0, y: 15, filter: 'blur(4px)' }}
      animate={isDashboard ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: isDashboard ? 0.15 : 0.4, 
        ease: isDashboard ? 'linear' : [0.22, 1, 0.36, 1], // easeOutCubic for public
      }}
      style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}
