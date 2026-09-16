'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.inner}>
                <div className="flex items-center gap-3">
                    <Link href="/" className={styles.logo}>
                        <img 
                            src="/qratten-logos/QRatten.png" 
                            alt="QRatten Logo" 
                            style={{ height: '52px', width: 'auto', objectFit: 'contain' }} 
                        />
                    </Link>
                    <div className="hidden sm:flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full border border-black bg-transparent text-black text-[12px] font-medium leading-none">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Beta
                    </div>
                </div>
                <div className={styles.actions}>
                    <Link href="/login">
                        <Button variant="secondary" size="md">Log in</Button>
                    </Link>
                    <Link href="/register" className={styles.getStartedBtn}>
                        Get Started
                    </Link>
                </div>
                
                {/* Mobile Hamburger Toggle */}
                <button 
                    className={styles.mobileToggle} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Content */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="secondary" className={styles.mobileBtn}>Log in</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="primary" className={styles.mobileBtn}>Get Started</Button>
                    </Link>
                </div>
            )}
        </nav>
    );
}
