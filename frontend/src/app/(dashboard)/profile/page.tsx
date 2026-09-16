'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { 
    User, 
    Mail, 
    Building, 
    Calendar, 
    Edit2, 
    Check, 
    X, 
    BarChart3, 
    Users, 
    Clock, 
    Activity,
    Lock,
    Bell,
    Trash2,
    ChevronRight,
    Search,
    Phone,
    Camera,
    IdCard,
    Loader2
} from 'lucide-react';
import { 
    Button, 
    Input, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent, 
    Badge, 
    Table, 
    TableHeader, 
    TableBody, 
    TableRow, 
    TableHead, 
    TableCell,
    Switch,
    Skeleton
} from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { authApi, qrApi, attendanceApi, usersApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import Cropper from 'react-easy-crop';

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], 'avatar.jpg', { type: 'image/jpeg' }))
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/jpeg')
  })
}

export default function ProfilePage() {
    const { user, updateUser: updateUserStore } = useAuthStore();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    // Section 1: Identity State
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user?.name || '');
    
    // Section 4: Settings State
    const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    
    const [mobileInput, setMobileInput] = useState(user?.mobileNumber || '');
    const [emailInput, setEmailInput] = useState(user?.email || '');

    // Password Verification Modal State for Contact Update
    const [isVerifyPasswordModalOpen, setIsVerifyPasswordModalOpen] = useState(false);
    const [verifyPassword, setVerifyPassword] = useState('');
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
    
    const [notifications, setNotifications] = useState({
        absenceAlerts: true,
        weeklySummary: true,
        lowAttendance: true
    });
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false);
    
    // Cropper State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('qratten-notifications');
            if (saved) setNotifications(JSON.parse(saved));
        }
    }, []);

    const saveNotifications = (newPrefs: typeof notifications) => {
        setNotifications(newPrefs);
        localStorage.setItem('qratten-notifications', JSON.stringify(newPrefs));
    };

    // Queries
    const { data: rawQrHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['qr-history'],
        queryFn: async () => {
            const res = await qrApi.getHistory();
            return res.data || [];
        },
        enabled: !!user?.id
    });

    const qrHistory = rawQrHistory || [];

    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students-count'],
        queryFn: async () => {
            const res = await usersApi.findAll();
            return (res.data || []).filter((u: any) => u.role === 'STUDENT');
        },
        enabled: !!user?.id && user?.role === 'TEACHER'
    });

    // Mutations

    const updateNameMutation = useMutation({
        mutationFn: (newName: string) => usersApi.update(user!.id, { name: newName }),
        onSuccess: (res) => {
            if (res.error) {
                alert('Failed to update name: ' + res.error);
                return;
            }
            setIsEditingName(false);
            if (res.data) updateUserStore(res.data as any);
        },
        onError: (error: any) => console.error(error.message || 'Update failed')
    });

    const updateContactMutation = useMutation({
        mutationFn: (data: { email?: string; mobileNumber?: string }) => usersApi.update(user!.id, data),
        onSuccess: (res) => {
            if (res.error) {
                showToast('error', 'Update Failed', res.error);
                return;
            }
            setIsEmailOpen(false);
            setIsMobileOpen(false);
            if (res.data) updateUserStore(res.data as any);
        },
        onError: (error: any) => showToast('error', 'Update Error', error.message || 'Update contact failed')
    });

    const handleVerifyAndUpdateContact = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!verifyPassword) {
            showToast('error', 'Password Required', 'Please enter your account password to confirm.');
            return;
        }

        setIsVerifyingPassword(true);
        try {
            const verifyRes = await authApi.login({
                email: user?.email || '',
                password: verifyPassword
            });

            if (verifyRes.error || !verifyRes.data) {
                showToast('error', 'Verification Failed', 'Incorrect password. Contact update canceled.');
                setIsVerifyingPassword(false);
                return;
            }

            const updateRes = await updateContactMutation.mutateAsync({
                mobileNumber: mobileInput,
                email: emailInput
            });

            if (updateRes?.error) {
                showToast('error', 'Update Failed', updateRes.error);
                return;
            }

            setIsVerifyPasswordModalOpen(false);
            setVerifyPassword('');
            showToast('success', 'Verified & Updated', 'Your contact info has been successfully verified and saved.');
        } catch (err: any) {
            showToast('error', 'Verification Error', err.message || 'Verification process failed.');
        } finally {
            setIsVerifyingPassword(false);
        }
    };

    const [isPhotoOptionsModalOpen, setIsPhotoOptionsModalOpen] = useState(false);

    const deleteAvatarMutation = useMutation({
        mutationFn: () => usersApi.deleteAvatar(user!.id),
        onSuccess: (res) => {
            if (res.error) {
                showToast('error', 'Delete Failed', res.error);
                return;
            }
            const updatedUser = {
                ...user,
                avatarUrl: null,
                avatar_url: null
            };
            updateUserStore(updatedUser as any);
            showToast('success', 'Photo Removed', 'Profile photo has been deleted and reset.');
            setIsPhotoOptionsModalOpen(false);
        },
        onError: (err: any) => {
            showToast('error', 'Delete Error', err.message || 'Failed to delete profile photo');
        }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setIsCropperOpen(true);
            
            // Clear input so selecting the same file again works
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const saveCrop = async () => {
        if (!previewUrl || !croppedAreaPixels) return;
        setIsCropping(true);
        try {
            const croppedFile = await getCroppedImg(previewUrl, croppedAreaPixels);
            if (croppedFile) {
                const res = await usersApi.uploadAvatar(user!.id, croppedFile);
                if (res.data) {
                    const avatarPath = (res.data as any).avatarUrl || (res.data as any).avatar_url;
                    const updatedUser = {
                        ...user,
                        ...res.data,
                        avatarUrl: avatarPath,
                        avatar_url: avatarPath
                    };
                    updateUserStore(updatedUser as any);
                    showToast('success', 'Profile Photo Updated', 'Your profile photo has been saved to the database.');
                } else if (res.error) {
                    showToast('error', 'Upload Failed', res.error);
                }
            }
        } catch (err: any) {
            showToast('error', 'Cropping Error', err.message || 'Failed to crop photo');
        } finally {
            setIsCropperOpen(false);
            setIsCropping(false);
            setPreviewUrl(null);
        }
    };

    const changePasswordMutation = useMutation({
        mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
        onSuccess: (res) => {
            if (res.error) {
                showToast('error', 'Update Failed', res.error);
                return;
            }
            showToast('success', 'Security Updated', 'Your password has been changed successfully.');
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            // update local password update timestamp
            if (user) {
                updateUserStore({ 
                    ...user, 
                    passwordUpdatedAt: new Date().toISOString() 
                });
            }

            // Keep success message for 5 seconds
            setTimeout(() => {
                setPasswordSuccess(false);
                setIsPasswordChangeOpen(false);
            }, 5000);
        },
        onError: (error: any) => {
            showToast('error', 'Critical Error', error.message || 'Password update failed');
        }
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => usersApi.delete(user!.id, deletePassword),
        onSuccess: (res) => {
            if (res.error) {
                alert('Account deletion failed: ' + res.error);
                return;
            }
            useAuthStore.getState().logout();
            window.location.href = '/login';
        },
        onError: (error: any) => {
            alert(error.message || 'Account deletion failed. Please check your password.');
        }
    });

    if (!isMounted || !user) {
        return (
            <div className="max-w-[1240px] mx-auto p-8 space-y-12 animate-in fade-in duration-500">
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    // Helpers
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Stat Calculations
    const stats = {
        sessionsThisMonth: qrHistory?.filter((s: any) => new Date(s.startTime || s.createdAt).getMonth() === new Date().getMonth()).length || 0,
        studentsManaged: students?.length || 0,
        avgAttendance: qrHistory?.length ? Math.round(qrHistory.reduce((acc: number, s: any) => acc + (s.attendancePercentage || 0), 0) / qrHistory.length) : 0,
        activeToday: qrHistory?.filter((s: any) => isToday(new Date(s.startTime || s.createdAt))).length || 0
    };

    return (
        <div className="max-w-[1240px] mx-auto p-8 pb-16 space-y-12 animate-in fade-in duration-500">
            {/* SECTION 1: Identity Card */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsPhotoOptionsModalOpen(true)} 
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold rounded-xl shadow-xs gap-1.5"
                    >
                        <Edit2 size={14} className="text-indigo-600" /> Edit Profile
                    </Button>
                </div>
                
                <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex flex-col items-center gap-4 relative">
                        <div 
                            className="relative w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-extrabold shadow-md shadow-indigo-100/50 overflow-hidden group shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            onClick={() => setIsPhotoOptionsModalOpen(true)}
                        >
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover animate-pulse"
                                />
                            ) : ((user as any)?.avatarUrl || (user as any)?.avatar_url) ? (
                                <img 
                                    src={getAvatarUrl((user as any).avatarUrl || (user as any).avatar_url)} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name ? getInitials(user.name) : <User size={40} />
                            )}
                            
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center">
                                <Camera size={20} className="text-white mb-1" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider text-center leading-tight">Edit<br/>Photo</span>
                            </div>
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            {isEditingName ? (
                                <Input 
                                    value={nameInput} 
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="max-w-xs text-xl font-bold h-9 bg-white border-slate-300 text-slate-900"
                                />
                            ) : (
                                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                            )}
                            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 uppercase tracking-wide">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 pt-1">
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5">
                                    <Building size={16} className="text-indigo-600 shrink-0" />
                                    <span className="font-semibold text-slate-800">QRatten Academy</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Calendar size={16} className="text-indigo-600 shrink-0" />
                                    <span className="font-medium text-slate-700">Member since March 2026</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5">
                                    <Mail size={16} className="text-indigo-600 shrink-0" />
                                    <span className="font-medium text-slate-700">{user?.email}</span>
                                </div>

                                {user?.mobileNumber && (
                                    <div className="flex items-center gap-2.5">
                                        <Phone size={16} className="text-indigo-600 shrink-0" />
                                        <span className="font-medium text-slate-700">{user.mobileNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* SECTION 3: Recent Sessions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-600" /> Recent Sessions
                    </h2>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-bold uppercase tracking-wider" onClick={() => window.location.href = '/dashboard/attendance'}>
                        View All <ChevronRight size={14} className="ml-1" />
                    </Button>
                </div>
                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Section</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Date</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Duration</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Attendance %</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider text-right whitespace-nowrap">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingHistory ? (
                                    [1, 2, 3].map(i => (
                                        <TableRow key={i} className="border-b border-slate-100"><TableCell colSpan={5}><Skeleton className="h-10 w-full bg-slate-200" /></TableCell></TableRow>
                                    ))
                                ) : (qrHistory && qrHistory.length > 0) ? qrHistory?.slice(0, 5).map((session: any) => {
                                    const sessionDate = new Date(session.startTime || session.createdAt);
                                    const isValidDate = !isNaN(sessionDate.getTime());
                                    
                                    return (
                                    <TableRow key={session.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                        <TableCell className="font-semibold text-slate-900 whitespace-nowrap">{session.section?.name || 'General'}</TableCell>
                                        <TableCell className="text-slate-600 text-xs whitespace-nowrap font-medium">{isValidDate ? sessionDate.toLocaleDateString() : 'Unknown Date'}</TableCell>
                                        <TableCell className="text-slate-600 text-xs whitespace-nowrap font-medium">{session.expiresInMinutes || 45}m</TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "font-bold text-sm",
                                                (session.attendancePercentage || 0) >= 80 ? "text-emerald-600" :
                                                (session.attendancePercentage || 0) >= 50 ? "text-amber-600" : "text-rose-600"
                                            )}>
                                                {session.attendancePercentage || 0}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={session.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                {session.status || 'ENDED'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-sm text-slate-500 font-medium">
                                            No session history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* SECTION 4: Account Settings */}
            <div className="space-y-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Lock size={20} className="text-indigo-600" /> Account Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8 h-full">
                        {/* Subsection A: Change Password */}
                        <Card className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl">
                            <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                                <Lock size={18} className="text-indigo-600" /> Security
                            </CardTitle>
                            
                            <div 
                                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 cursor-pointer transition-colors" 
                                onClick={() => setIsPasswordChangeOpen(!isPasswordChangeOpen)}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Password</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Last updated: {user?.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'Never'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-indigo-600">Change</span>
                                    <ChevronRight className={cn("text-slate-400 transition-transform", isPasswordChangeOpen && "rotate-90")} size={16} />
                                </div>
                            </div>

                            {isPasswordChangeOpen && (
                                <div className="space-y-4 mt-4 p-5 border border-slate-200/80 bg-slate-50/70 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Current Password</label>
                                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 h-11" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password</label>
                                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 h-11" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm New Password</label>
                                        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 h-11" placeholder="••••••••" />
                                    </div>
                                    <Button 
                                        className={cn("w-full mt-4 h-11 font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl", passwordSuccess && "bg-emerald-600 hover:bg-emerald-700")}
                                        disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || changePasswordMutation.isPending || passwordSuccess}
                                        onClick={() => changePasswordMutation.mutate()}
                                    >
                                        {changePasswordMutation.isPending ? 'Updating...' : 
                                         passwordSuccess ? 'Successfully Updated!' : 'Update Password'}
                                    </Button>
                                    
                                    {passwordSuccess && (
                                        <p className="text-[11px] text-emerald-600 font-bold text-center mt-2 animate-pulse uppercase tracking-wider">
                                            Password Refinement Complete
                                        </p>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Subsection C: Contact Info */}
                        <Card className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl space-y-4">
                            <CardTitle className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                <Mail size={18} className="text-indigo-600" /> Contact Info
                            </CardTitle>
                            
                            {/* Box 1: Email Address */}
                            <div className="space-y-3">
                                <div 
                                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 cursor-pointer transition-colors" 
                                    onClick={() => setIsEmailOpen(!isEmailOpen)}
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <Mail size={15} className="text-indigo-600" /> Email Address
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">{user?.email || 'No email set'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-indigo-600">Edit</span>
                                        <ChevronRight className={cn("text-slate-400 transition-transform", isEmailOpen && "rotate-90")} size={16} />
                                    </div>
                                </div>

                                {isEmailOpen && (
                                    <div className="space-y-3 p-4 border border-slate-200/80 bg-slate-50/70 rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Email Address</label>
                                            <Input 
                                                value={emailInput} 
                                                onChange={e => setEmailInput(e.target.value)} 
                                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-11 font-medium" 
                                                placeholder="your@email.com" 
                                            />
                                        </div>
                                        <Button 
                                            className="w-full h-11 font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl"
                                            disabled={updateContactMutation.isPending || emailInput === (user?.email || '')}
                                            onClick={() => {
                                                setVerifyPassword('');
                                                setIsVerifyPasswordModalOpen(true);
                                            }}
                                        >
                                            {updateContactMutation.isPending ? 'Saving Email...' : 'Save Email Address'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Box 2: Mobile Number */}
                            <div className="space-y-3 pt-1">
                                <div 
                                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 cursor-pointer transition-colors" 
                                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <Phone size={15} className="text-indigo-600" /> Mobile Number
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">{user?.mobileNumber || 'No mobile set'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-indigo-600">Edit</span>
                                        <ChevronRight className={cn("text-slate-400 transition-transform", isMobileOpen && "rotate-90")} size={16} />
                                    </div>
                                </div>

                                {isMobileOpen && (
                                    <div className="space-y-3 p-4 border border-slate-200/80 bg-slate-50/70 rounded-xl animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Mobile Number</label>
                                            <Input 
                                                value={mobileInput} 
                                                onChange={e => setMobileInput(e.target.value)} 
                                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 h-11 font-medium" 
                                                placeholder="+1 (555) 000-0000" 
                                            />
                                        </div>
                                        <Button 
                                            className="w-full h-11 font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl"
                                            disabled={updateContactMutation.isPending || mobileInput === (user?.mobileNumber || '')}
                                            onClick={() => {
                                                setVerifyPassword('');
                                                setIsVerifyPasswordModalOpen(true);
                                            }}
                                        >
                                            {updateContactMutation.isPending ? 'Saving Mobile...' : 'Save Mobile Number'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Subsection B: Notification Preferences */}
                    <Card className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl h-full">
                        <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                            <Bell size={18} className="text-indigo-600" /> Notifications
                        </CardTitle>
                        <div className="space-y-6">
                            {[
                                { id: 'absenceAlerts', label: 'Absence alerts', sub: 'Get notified when a student is absent' },
                                { id: 'weeklySummary', label: 'Weekly summary', sub: 'Receive weekly report every Monday' },
                                { id: 'lowAttendance', label: 'Low attendance warnings', sub: 'Alert when attendance drops below 75%' },
                            ].map((pref) => (
                                <div key={pref.id} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-slate-900">{pref.label}</p>
                                        <p className="text-[11px] text-slate-500 leading-none">{pref.sub}</p>
                                    </div>
                                    <Switch 
                                        checked={(notifications as any)[pref.id]} 
                                        onCheckedChange={(checked) => saveNotifications({ ...notifications, [pref.id]: checked })} 
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Subsection C: Danger Zone */}
                <div className="pt-8 border-t border-white/5">
                    <Card className="border-destructive/30 bg-destructive/5 p-6 border-2 border-dashed">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-destructive flex items-center gap-2 justify-center md:justify-start">
                                    <Trash2 size={20} /> Danger Zone
                                </h3>
                                <p className="text-sm text-destructive/70">Permanently delete your account and all associated data.</p>
                            </div>
                            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                Delete Account
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Account"
            >
                <div className="space-y-6 p-1">
                    <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive text-sm leading-relaxed">
                        <p className="font-bold mb-1">Are you sure? This action cannot be undone.</p>
                        <p>All your sessions, reports, and attendance data will be permanently deleted from our servers.</p>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                type="password"
                                placeholder="Enter your password to confirm"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="pl-12 bg-white/5 border-white/10 focus-visible:ring-primary/20 h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end pt-2">
                        <Button variant="ghost" onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setDeletePassword('');
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                if (!deletePassword) {
                                    alert('Please enter your password to confirm deletion');
                                    return;
                                }
                                deleteAccountMutation.mutate();
                            }}
                            disabled={deleteAccountMutation.isPending || !deletePassword}
                            className="px-8 shadow-lg shadow-destructive/20"
                        >
                            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete permanently'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Photo View Overlay (Round Only) */}
            {isPhotoPopupOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsPhotoPopupOpen(false)}
                >
                    <button 
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                        onClick={() => setIsPhotoPopupOpen(false)}
                    >
                        <X size={32} />
                    </button>
                    
                    <div 
                        className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full overflow-hidden border-8 border-primary/20 shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)] animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-primary bg-gradient-to-br from-primary/10 to-accent/10">
                            <div className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center text-7xl font-bold">
                                {user?.name ? getInitials(user.name) : 'U'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo & Profile Management Modal */}
            <Modal
                isOpen={isPhotoOptionsModalOpen}
                onClose={() => setIsPhotoOptionsModalOpen(false)}
                title="Edit Profile & Photo"
            >
                <div className="space-y-6 p-2 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-28 h-28 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center text-primary text-4xl font-bold overflow-hidden shadow-xl">
                            {((user as any)?.avatarUrl || (user as any)?.avatar_url) ? (
                                <img 
                                    src={getAvatarUrl((user as any).avatarUrl || (user as any).avatar_url)} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name ? getInitials(user.name) : <User size={48} />
                            )}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {((user as any)?.avatarUrl || (user as any)?.avatar_url) 
                                ? "Current Profile Photo" 
                                : "No custom photo uploaded yet"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Button 
                            variant="primary" 
                            className="h-12 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                            onClick={() => {
                                setIsPhotoOptionsModalOpen(false);
                                fileInputRef.current?.click();
                            }}
                        >
                            <Camera size={18} />
                            <span>Add / Change Photo</span>
                        </Button>

                        <Button 
                            variant="destructive" 
                            className="h-12 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                            disabled={!((user as any)?.avatarUrl || (user as any)?.avatar_url) || deleteAvatarMutation.isPending}
                            onClick={() => deleteAvatarMutation.mutate()}
                        >
                            <Trash2 size={18} />
                            <span>{deleteAvatarMutation.isPending ? "Deleting..." : "Delete Photo"}</span>
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-left space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                        <div className="flex gap-2">
                            <Input 
                                value={nameInput} 
                                onChange={(e) => setNameInput(e.target.value)} 
                                className="bg-white/5 border-white/10 h-10 font-semibold"
                                placeholder="Enter full name..."
                            />
                            <Button 
                                variant="secondary"
                                size="sm" 
                                disabled={updateNameMutation.isPending || nameInput === user.name}
                                onClick={() => {
                                    updateNameMutation.mutate(nameInput);
                                    setIsPhotoOptionsModalOpen(false);
                                }}
                            >
                                Save Name
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Cropper Modal */}
            <Modal
                isOpen={isCropperOpen}
                onClose={() => !isCropping && setIsCropperOpen(false)}
                title="Crop your photo"
            >
                <div className="relative h-[400px] bg-slate-900 w-full rounded-xl overflow-hidden mb-4">
                    {previewUrl && (
                        <Cropper
                            image={previewUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={handleCropComplete}
                            onZoomChange={setZoom}
                        />
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-label="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-1/2"
                    />
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setIsCropperOpen(false)} disabled={isCropping}>Cancel</Button>
                        <Button variant="primary" onClick={saveCrop} disabled={isCropping}>
                            {isCropping ? 'Saving...' : 'Save Crop'}
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={isVerifyPasswordModalOpen}
                onClose={() => !isVerifyingPassword && setIsVerifyPasswordModalOpen(false)}
                title="Security Verification Required"
            >
                <form onSubmit={handleVerifyAndUpdateContact} className="space-y-5 py-2">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-amber-900 text-xs font-medium">
                        <Lock size={20} className="text-amber-600 shrink-0" />
                        <span>For account security, please enter your password to verify and save your updated contact details.</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Account Password</label>
                        <Input 
                            type="password" 
                            value={verifyPassword} 
                            onChange={(e) => setVerifyPassword(e.target.value)} 
                            placeholder="Enter your current password..."
                            className="bg-white border-slate-300 text-slate-900 h-11 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setIsVerifyPasswordModalOpen(false)} 
                            disabled={isVerifyingPassword}
                            className="text-slate-700 font-semibold border-slate-300 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 px-6 rounded-xl shadow-sm gap-2"
                            disabled={!verifyPassword || isVerifyingPassword}
                        >
                            {isVerifyingPassword ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Verifying Password...</span>
                                </>
                            ) : (
                                <span>Verify & Save Changes</span>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
