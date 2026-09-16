'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link. Missing token or email.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/verify-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, email }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail?.message || data.message || 'Verification failed');
                }

                setStatus('success');
                setMessage(data.message || 'Email verified successfully. You can now log in.');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'An error occurred during verification.');
            }
        };

        verifyEmail();
    }, [token, email]);

    return (
        <div className="w-full max-w-[500px] bg-white/90 dark:bg-[#0C0C0E]/80 backdrop-blur-3xl border border-zinc-200/60 dark:border-white/[0.08] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto">
            <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-zinc-900 dark:text-white animate-spin" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                            Verifying...
                        </h1>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                            Email Verified!
                        </h1>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                            Verification Failed
                        </h1>
                    </>
                )}
                
                <p className="text-zinc-600 dark:text-white/60 mb-8">
                    {message}
                </p>

                <div className="w-full pt-6 border-t border-zinc-200/60 dark:border-white/[0.08] flex justify-center">
                    <Link 
                        href="/login" 
                        className="inline-flex items-center justify-center h-12 px-6 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/90 rounded-xl text-[15px] font-semibold shadow-md hover:shadow-lg transition-all gap-2"
                    >
                        Continue to Login
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="text-center p-8 text-white">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
