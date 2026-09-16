import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getAvatarUrl(path: string | undefined | null) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
