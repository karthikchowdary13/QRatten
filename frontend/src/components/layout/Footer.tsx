import { Github, Linkedin, Instagram, Globe } from 'lucide-react';

export default function Footer() {
    const currentYear = 2026;

    return (
        <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Left — Built by & Copyright */}
                    <div className="flex flex-col gap-1 items-center sm:items-start">
                        <div className="text-sm text-slate-500">
                            Built and developed by <span className="font-bold text-slate-800">Jayakanth Kamisetti</span>
                        </div>
                        <div className="text-xs text-slate-400">
                            © {currentYear}
                        </div>
                    </div>

                    {/* Right — Social Links */}
                    <div className="flex items-center gap-5 text-slate-400">
                        <Github size={18} className="hover:text-slate-600 cursor-pointer transition-colors" />
                        <Linkedin size={18} className="hover:text-slate-600 cursor-pointer transition-colors" />
                        <Instagram size={18} className="hover:text-slate-600 cursor-pointer transition-colors" />
                        <Globe size={18} className="hover:text-slate-600 cursor-pointer transition-colors" />
                    </div>

                </div>
            </div>
        </footer>
    );
}
