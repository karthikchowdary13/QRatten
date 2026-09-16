import PrismBackground from '@/components/PrismBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#f0f1ff] via-[#e8f4fd] to-[#f4f6fa] dark:from-[#09090b] dark:via-[#0c0c0e] dark:to-[#121214] relative overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-80 mix-blend-screen dark:mix-blend-lighten">
                <PrismBackground animationType="3drotate" glow={1.5} scale={3} timeScale={0.4} colorFrequency={1.2} />
            </div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
            <div className="relative z-10 w-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
