'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { saveAuthSession } from '@/lib/auth';

import {
    Shield,
    Mail,
    Lock,
    Loader2,
    Eye,
    EyeOff,
    Zap,
    Users,
    BarChart3,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';

import { useToast } from '@/context/ToastContext';

import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();

    const setAuth = useAuthStore((state) => state.setAuth);
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);

    // =========================================================
    // LOGIN
    // =========================================================

    const performLogin = async (loginEmail: string, loginPass: string) => {
        setLoading(true);

        try {
            const response = await authApi.login({
                email: loginEmail.toLowerCase().trim(),
                password: loginPass,
            });

            if (response.error) {
                if (response.error === 'User does not exist') {
                    showToast(
                        'error',
                        'User Not Found',
                        'No account exists with this email.'
                    );
                } else if (
                    response.error === 'Incorrect email or password'
                ) {
                    showToast(
                        'error',
                        'Login Failed',
                        'The password you entered is incorrect.'
                    );
                } else if (
                    response.error.includes('verify your email')
                ) {
                    setNeedsVerification(true);

                    showToast(
                        'warning',
                        'Verification Required',
                        'Please verify your email before logging in.'
                    );
                } else {
                    showToast(
                        'error',
                        'Login Failed',
                        response.error
                    );
                }

                setLoading(false);
                return;
            }

            const {
                user,
                accessToken,
                refreshToken,
            } = response.data;

            saveAuthSession(
                accessToken,
                refreshToken,
                user
            );

            setAuth(
                user,
                accessToken,
                refreshToken
            );

            const dashboardMap: Record<string, string> = {
                STUDENT: '/dashboard/attendance',
                TEACHER: '/dashboard',
                ADMIN: '/admin',
                SUPER_ADMIN: '/admin',
                INSTITUTION_ADMIN: '/admin',
            };

            const roleKey = (user.role || '').toUpperCase();
            router.push(
                dashboardMap[roleKey] || '/dashboard'
            );
        } catch (err: any) {
            showToast(
                'error',
                'Connection Error',
                'Authentication failed. Please check your connection.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!email || !password) {
            showToast(
                'warning',
                'Validation Error',
                'Please fill in all fields.'
            );
            return;
        }

        await performLogin(email, password);
    };

    const handleGuestLogin = () => {
        performLogin('guest@qratten.com', 'guest123');
    };

    // =========================================================
    // RESEND VERIFICATION
    // =========================================================

    const handleResendVerification = async () => {
        if (!email) return;

        setResendLoading(true);

        try {
            const response =
                await authApi.resendVerification(email);

            if (response.error) {
                showToast(
                    'error',
                    'Failed',
                    response.error
                );
            } else {
                showToast(
                    'success',
                    'Email Sent',
                    'Verification email has been resent.'
                );
            }
        } catch (error) {
            showToast(
                'error',
                'Failed',
                'Failed to resend verification email.'
            );
        } finally {
            setResendLoading(false);
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
                                Simplifying
                                <br />

                                Attendance for a
                                <br />

                                <span>
                                    Smarter Tomorrow.
                                </span>
                            </h2>

                            <p className={styles.heroDescription}>
                                Secure, real-time, and hassle-free
                                attendance management for students,
                                teachers, and administrators.
                            </p>


                            {/* ---------------- FEATURES ---------------- */}

                            <div className={styles.features}>

                                {/* Secure */}
                                <div className={styles.feature}>

                                    <div className={styles.featureIcon}>
                                        <Shield />
                                    </div>

                                    <h3>
                                        Secure
                                    </h3>

                                    <p>
                                        Fraud-proof
                                        <br />
                                        attendance
                                    </p>

                                </div>


                                {/* Real Time */}
                                <div className={styles.feature}>

                                    <div className={styles.featureIcon}>
                                        <Zap />
                                    </div>

                                    <h3>
                                        Real-Time
                                    </h3>

                                    <p>
                                        Instant
                                        <br />
                                        updates
                                    </p>

                                </div>


                                {/* Everyone */}
                                <div className={styles.feature}>

                                    <div className={styles.featureIcon}>
                                        <Users />
                                    </div>

                                    <h3>
                                        For Everyone
                                    </h3>

                                    <p>
                                        Students,
                                        <br />
                                        Teachers, Admins
                                    </p>

                                </div>


                                {/* Insights */}
                                <div className={styles.feature}>

                                    <div className={styles.featureIcon}>
                                        <BarChart3 />
                                    </div>

                                    <h3>
                                        Insights
                                    </h3>

                                    <p>
                                        Data-driven
                                        <br />
                                        decisions
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ---------------- HERO FOOTER ---------------- */}

                        <div className={styles.heroBottom}>

                            <div className={styles.heroQuote}>
                                <span>
                                    Attend Today
                                </span>

                                <span>
                                    Achieve Tomorrow
                                </span>

                                <div />
                            </div>

                            <div className={styles.heroTrust}>
                                <CheckCircle2 />
                                Built for modern education
                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    RIGHT LOGIN
                ====================================================== */}

                <section className={styles.loginSection}>

                    {/* Decorative shapes */}
                    <div className={styles.decorCircleOne} />
                    <div className={styles.decorCircleTwo} />


                    {/* ---------------- TOP NAV ---------------- */}

                    <div className={styles.topNav}>

                        <span>
                            New here?
                        </span>

                        <Link
                            href="/register"
                            className={styles.signupButton}
                        >
                            Sign up
                        </Link>

                    </div>


                    {/* ---------------- LOGIN CONTENT ---------------- */}

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

                                <h1 className={styles.title}>
                                    Welcome back 👋
                                </h1>

                                <p className={styles.subtitle}>
                                    Log in to your QRatten account
                                </p>

                            </div>


                            {/* Verification banner */}
                            {needsVerification && (
                                <div className={styles.errorBanner}>

                                    <Mail
                                        className={
                                            styles.errorIcon
                                        }
                                    />

                                    <div>

                                        <h3>
                                            Email Verification Required
                                        </h3>

                                        <p>
                                            Please verify your email
                                            address to continue.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                handleResendVerification
                                            }
                                            disabled={
                                                resendLoading
                                            }
                                            className={
                                                styles.resendButton
                                            }
                                        >
                                            {resendLoading
                                                ? 'Sending...'
                                                : 'Resend Verification Email'}
                                        </button>

                                    </div>

                                </div>
                            )}


                            {/* =================================================
                                FORM
                            ================================================= */}

                            <form
                                onSubmit={handleLogin}
                                className={styles.form}
                            >

                                {/* EMAIL */}

                                <div className={styles.formGroup}>

                                    <label
                                        className={styles.label}
                                    >
                                        Institution Email
                                    </label>

                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <Mail
                                            className={
                                                styles.inputIcon
                                            }
                                        />

                                        <input
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="name@institution.com"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            disabled={loading}
                                            className={
                                                styles.input
                                            }
                                        />

                                    </div>

                                </div>


                                {/* PASSWORD */}

                                <div className={styles.formGroup}>

                                    <label
                                        className={styles.label}
                                    >
                                        Password
                                    </label>

                                    <div
                                        className={
                                            styles.inputWrapper
                                        }
                                    >

                                        <Lock
                                            className={
                                                styles.inputIcon
                                            }
                                        />

                                        <input
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter your password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            autoComplete="current-password"
                                            required
                                            disabled={loading}
                                            className={
                                                styles.input
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className={
                                                styles.passwordToggle
                                            }
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff />
                                            ) : (
                                                <Eye />
                                            )}
                                        </button>

                                    </div>


                                    {/* Forgot password */}

                                    <div
                                        className={
                                            styles.forgotPassword
                                        }
                                    >
                                        <Link href="/forgot-password">
                                            Forgot password?
                                        </Link>
                                    </div>

                                </div>


                                {/* SIGN IN */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={
                                        styles.submitButton
                                    }
                                >

                                    {loading ? (
                                        <>
                                            <Loader2
                                                className={
                                                    styles.loader
                                                }
                                            />

                                            <span>
                                                Authenticating...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                Sign In
                                            </span>

                                            <ArrowRight />
                                        </>
                                    )}

                                </button>

                                 {/* DEMO ACCOUNTS QUICK LOGIN */}
                                 <div style={{ marginTop: '1.25rem', marginBottom: '0.25rem' }}>
                                     <div style={{
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '8px',
                                         fontSize: '11px',
                                         color: '#64748b',
                                         marginBottom: '8px',
                                         fontWeight: 600,
                                         textTransform: 'uppercase',
                                         letterSpacing: '0.5px'
                                     }}>
                                         <span>Quick Demo Access</span>
                                         <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                                     </div>

                                     <div style={{
                                         display: 'grid',
                                         gridTemplateColumns: 'repeat(3, 1fr)',
                                         gap: '8px',
                                     }}>
                                         <button
                                             type="button"
                                             onClick={() => performLogin('faculty@qratten.com', 'faculty123')}
                                             disabled={loading}
                                             style={{
                                                 padding: '8px 6px',
                                                 borderRadius: '8px',
                                                 backgroundColor: '#eff6ff',
                                                 border: '1px solid #bfdbfe',
                                                 color: '#1d4ed8',
                                                 fontSize: '12px',
                                                 fontWeight: 600,
                                                 cursor: 'pointer',
                                                 transition: 'all 0.15s',
                                                 textAlign: 'center'
                                             }}
                                             onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                                             onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                         >
                                             🎓 Faculty
                                         </button>

                                         <button
                                             type="button"
                                             onClick={() => performLogin('student@qratten.com', 'student123')}
                                             disabled={loading}
                                             style={{
                                                 padding: '8px 6px',
                                                 borderRadius: '8px',
                                                 backgroundColor: '#f0fdf4',
                                                 border: '1px solid #bbf7d0',
                                                 color: '#15803d',
                                                 fontSize: '12px',
                                                 fontWeight: 600,
                                                 cursor: 'pointer',
                                                 transition: 'all 0.15s',
                                                 textAlign: 'center'
                                             }}
                                             onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; }}
                                             onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                         >
                                             📚 Student
                                         </button>

                                         <button
                                             type="button"
                                             onClick={() => performLogin('admin@qratten.com', 'admin123')}
                                             disabled={loading}
                                             style={{
                                                 padding: '8px 6px',
                                                 borderRadius: '8px',
                                                 backgroundColor: '#faf5ff',
                                                 border: '1px solid #e9d5ff',
                                                 color: '#7e22ce',
                                                 fontSize: '12px',
                                                 fontWeight: 600,
                                                 cursor: 'pointer',
                                                 transition: 'all 0.15s',
                                                 textAlign: 'center'
                                             }}
                                             onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f3e8ff'; }}
                                             onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#faf5ff'; }}
                                         >
                                             ⚡ Admin
                                         </button>
                                     </div>
                                 </div>

                                 {/* GUEST LOGIN */}
                                 <button
                                     type="button"
                                     onClick={handleGuestLogin}
                                     disabled={loading}
                                     style={{
                                         width: '100%',
                                         padding: '0.75rem',
                                         borderRadius: '0.75rem',
                                         backgroundColor: '#f1f5f9',
                                         color: '#334155',
                                         border: '1px solid #e2e8f0',
                                         display: 'flex',
                                         justifyContent: 'center',
                                         alignItems: 'center',
                                         gap: '0.5rem',
                                         fontWeight: '500',
                                         marginTop: '0.5rem',
                                         cursor: 'pointer',
                                         transition: 'all 0.2s'
                                     }}
                                     onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                                     onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                                 >
                                     <Users size={18} />
                                     <span>Continue as Guest</span>
                                 </button>

                                {/* SECURITY */}

                                <div
                                    className={
                                        styles.security
                                    }
                                >

                                    <Shield />

                                    <span>
                                        Your data is secure and encrypted
                                    </span>

                                </div>


                                {/* SIGN UP */}

                                <p
                                    className={
                                        styles.footer
                                    }
                                >
                                    Don't have an account?{' '}

                                    <Link
                                        href="/register"
                                        className={
                                            styles.link
                                        }
                                    >
                                        Sign up
                                    </Link>
                                </p>

                            </form>

                        </div>

                    </div>


                    {/* ---------------- FOOTER ---------------- */}

                    <footer className={styles.pageFooter}>

                        <span>
                            © 2026 QRatten. Empowering Education
                            Through Technology.
                        </span>

                        <div>

                            <Link href="/privacy">
                                Privacy Policy
                            </Link>

                            <span>|</span>

                            <Link href="/terms">
                                Terms of Service
                            </Link>

                            <span>|</span>

                            <Link href="/support">
                                Support
                            </Link>

                        </div>

                    </footer>

                </section>

            </div>

        </main>
    );
}