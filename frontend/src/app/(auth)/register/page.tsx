'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import {
    Shield,
    Mail,
    User,
    Phone,
    Loader2,
    QrCode,
    Sparkles,
    ArrowRight,
    Zap
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import styles from '../login/login.module.css';

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'];

export default function RegisterPage() {
    const router = useRouter();
    const { showToast } = useToast();

    // Wake up Render backend on load
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/`).catch(() => {});
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        role: 'STUDENT'
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRoleSelect = (role: string) => {
        setFormData((prev) => ({ ...prev, role }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            setError('Please fill in all required fields');
            showToast('warning', 'Validation Error', 'Please fill in all required fields.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const regResponse = await authApi.register({
                name: formData.name,
                email: formData.email.toLowerCase().trim(),
                role: formData.role,
                mobileNumber: formData.mobileNumber
            });

            if (regResponse.error) {
                setError(regResponse.error);
                showToast('error', 'Registration Failed', regResponse.error);
                setLoading(false);
                return;
            }

            showToast(
                'info',
                'Pending Approval',
                'Your request has been forwarded to the administrator.'
            );
            router.push(
                `/check-email?email=${encodeURIComponent(
                    formData.email.toLowerCase().trim()
                )}`
            );
        } catch (err: any) {
            setError('Connection failed. Please try again later.');
            showToast('error', 'Error', 'Connection failed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.layout}>
                {/* =====================================================
                    LEFT HERO
                ====================================================== */}
                <section className={styles.hero}>
                    {/* Background image */}
                    <div className={styles.heroImage} />

                    {/* Dark overlay */}
                    <div className={styles.heroOverlay} />

                    {/* Decorative glow */}
                    <div className={styles.heroGlow} />

                    <div className={styles.heroContent}>
                        {/* ---------------- LOGO ---------------- */}
                        <div className={styles.brand}>
                            <Link href="/">
                                <img
                                    src="/qratten-logos/QRatten.png"
                                    alt="QRatten"
                                    className={styles.logo}
                                />
                            </Link>
                            <p className={styles.tagline}>
                                Smart Attendance. Brighter Tomorrow.
                            </p>
                        </div>

                        {/* ---------------- HERO CENTER ---------------- */}
                        <div className={styles.heroMiddle}>
                            <div className={styles.trusted}>
                                <span />
                                TRUSTED BY MODERN INSTITUTIONS
                            </div>

                            <h2 className={styles.heroTitle}>
                                Join the
                                <br />
                                <span>revolution.</span>
                            </h2>

                            <p className={styles.heroDescription}>
                                Create your account to start managing attendance with cutting-edge
                                QR technology and real-time analytics.
                            </p>

                            {/* ---------------- FEATURES ---------------- */}
                            <div className={styles.features}>
                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>
                                        <QrCode />
                                    </div>
                                    <h3>Dynamic QR</h3>
                                    <p>30s rotating tokens</p>
                                </div>

                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>
                                        <Shield />
                                    </div>
                                    <h3>Anti-Proxy</h3>
                                    <p>Single-use security</p>
                                </div>

                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>
                                        <Zap />
                                    </div>
                                    <h3>Real-Time</h3>
                                    <p>Instant analytics</p>
                                </div>

                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>
                                        <Sparkles />
                                    </div>
                                    <h3>Smart Sync</h3>
                                    <p>Offline support</p>
                                </div>
                            </div>
                        </div>

                        {/* ---------------- HERO BOTTOM ---------------- */}
                        <div className={styles.heroBottom}>
                            <div className={styles.heroQuote}>
                                <span>Presence Verified.</span>
                                <span>Future Defined.</span>
                                <div />
                            </div>

                            <div className={styles.heroTrust}>
                                <Shield />
                                <span>Bank-grade security</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    RIGHT REGISTER SECTION
                ====================================================== */}
                <section className={styles.loginSection}>
                    {/* Decorative shapes */}
                    <div className={styles.decorCircleOne} />
                    <div className={styles.decorCircleTwo} />

                    {/* TOP NAV */}
                    <div className={styles.topNav}>
                        <span>Already have an account?</span>
                        <Link href="/login" className={styles.signupButton}>
                            Sign In
                        </Link>
                    </div>

                    {/* REGISTER CONTAINER */}
                    <div className={styles.loginWrapper}>
                        <div className={styles.loginContainer}>
                            {/* Mobile Logo */}
                            <div className={styles.mobileLogo}>
                                <Link href="/">
                                    <img
                                        src="/qratten-logos/QRatten.png"
                                        alt="QRatten"
                                    />
                                </Link>
                            </div>

                            {/* Header */}
                            <div className={styles.header}>
                                <h1 className={styles.title}>Create an account</h1>
                                <p className={styles.subtitle}>
                                    Enter your details below to get started
                                </p>
                            </div>

                            {/* Error banner */}
                            {error && (
                                <div className={styles.errorBanner}>
                                    <div>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* FORM */}
                            <form onSubmit={handleRegister} className={styles.form}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* FULL NAME */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <div className={styles.inputWrapper}>
                                            <User className={styles.inputIcon} />
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                type="text"
                                                autoComplete="name"
                                                required
                                                disabled={loading}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>

                                    {/* MOBILE (OPTIONAL) */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Mobile (Optional)</label>
                                        <div className={styles.inputWrapper}>
                                            <Phone className={styles.inputIcon} />
                                            <input
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 000-0000"
                                                type="tel"
                                                autoComplete="tel"
                                                disabled={loading}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* EMAIL ADDRESS */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <div className={styles.inputWrapper}>
                                        <Mail className={styles.inputIcon} />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="name@institution.com"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            disabled={loading}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                {/* ACCOUNT TYPE */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Account Type</label>
                                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 border border-slate-200 rounded-xl">
                                        {ROLES.map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => handleRoleSelect(r)}
                                                className={`py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                                    formData.role === r
                                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/40'
                                                }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={styles.submitButton}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className={styles.loader} />
                                            <span>Creating account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create account</span>
                                            <ArrowRight />
                                        </>
                                    )}
                                </button>

                                {/* SECURITY BADGE */}
                                <div className={styles.security}>
                                    <Shield />
                                    <span>Your data is secure and encrypted</span>
                                </div>

                                {/* SIGN IN LINK */}
                                <p className={styles.footer}>
                                    Already have an account?{' '}
                                    <Link href="/login" className={styles.link}>
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* PAGE FOOTER */}
                    <footer className={styles.pageFooter}>
                        <span>
                            © 2026 QRatten. Empowering Education Through Technology.
                        </span>
                        <div>
                            <Link href="/privacy">Privacy Policy</Link>
                            <span>|</span>
                            <Link href="/terms">Terms of Service</Link>
                            <span>|</span>
                            <Link href="/support">Support</Link>
                        </div>
                    </footer>
                </section>
            </div>
        </main>
    );
}