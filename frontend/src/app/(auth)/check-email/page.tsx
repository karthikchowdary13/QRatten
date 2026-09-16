'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="w-full max-w-[500px] bg-white/90 dark:bg-[#0C0C0E]/80 backdrop-blur-3xl border border-zinc-200/60 dark:border-white/8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto">
            <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-blue-500" />
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                    Request Sent!
                </h1>
                
                <p className="text-zinc-600 dark:text-white/60 mb-8">
                    Your registration request for<br />
                    <span className="font-semibold text-zinc-900 dark:text-white">{email || "your email address"}</span><br />
                    has been securely forwarded to the administrator.
                    <br /><br />
                    You will receive an email with your secure temporary password once your account is approved.
                </p>

                <div className="w-full pt-6 border-t border-zinc-200/60 dark:border-white/8 flex flex-col items-center gap-4">
                    <button 
                        onClick={async () => {
                            try {
                                const res = await fetch(`${API_BASE}/api/test-email`);
                                const data = await res.json();
                                alert(JSON.stringify(data));
                            } catch (e) {
                                alert("Fetch failed: " + e);
                            }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium mb-2"
                    >
                        Run Diagnostic Email Test
                    </button>
                    <p className="text-sm text-zinc-500 dark:text-white/40">
                        Please wait for the administrator to review your request.
                    </p>
                    <Link 
                        href="/login" 
                        className="inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-white/80 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <Suspense fallback={<div className="text-center p-8 text-white">Loading...</div>}>
            <CheckEmailContent />
        </Suspense>
    );
}
