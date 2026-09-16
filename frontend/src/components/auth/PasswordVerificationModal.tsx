'use client';

import { useState } from 'react';
import { Lock, Loader2, ShieldCheck, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface PasswordVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: () => void | Promise<void>;
    title?: string;
    description?: string;
}

export default function PasswordVerificationModal({
    isOpen,
    onClose,
    onVerified,
    title = 'Security Verification Required',
    description = 'Please enter your account password to authorize and save these changes.'
}: PasswordVerificationModalProps) {
    const { showToast } = useToast();
    const user = useAuthStore((state) => state.user);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!password) {
            showToast('error', 'Password Required', 'Please enter your current account password.');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.login({
                email: user?.email || '',
                password: password
            });

            if (res.error || !res.data) {
                showToast('error', 'Verification Failed', 'Incorrect password. Action canceled.');
                setLoading(false);
                return;
            }

            // Successfully verified!
            setPassword('');
            setLoading(false);
            onClose();
            await onVerified();
        } catch (err: any) {
            showToast('error', 'Verification Error', err?.message || 'Password authentication failed.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
                            <p className="text-xs font-semibold text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setPassword(''); onClose(); }}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        {description}
                    </p>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Current Account Password
                        </label>
                        <Input 
                            type="password"
                            placeholder="Enter password to confirm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-50 border-slate-300 text-slate-900 font-semibold h-11"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={() => { setPassword(''); onClose(); }}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl h-11 px-5"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 shadow-sm gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                            Confirm & Save
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
