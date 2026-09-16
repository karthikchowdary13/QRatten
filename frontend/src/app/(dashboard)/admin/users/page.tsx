'use client';

import { useEffect, useState } from 'react';
import { adminApi, authApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    Users, 
    Search, 
    Filter, 
    CheckCircle2,
    XCircle,
    UserMinus,
    UserCog,
    UserPlus,
    Loader2,
    ShieldAlert,
    Ban,
    UserCheck
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Badge, Button, Input, Card } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import PasswordVerificationModal from '@/components/auth/PasswordVerificationModal';

export default function UserManagement() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Security Verification State
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => Promise<void> | void) | null>(null);
    const [verifyTitle, setVerifyTitle] = useState('Security Verification Required');
    const [verifyDesc, setVerifyDesc] = useState('Please enter your account password to authorize and save user modifications.');

    // Role Change Modal State
    const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
    const [newRole, setNewRole] = useState<string>('STUDENT');
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);

    // Create User Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createRole, setCreateRole] = useState('STUDENT');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await adminApi.getUsers();
            if (data && data.length > 0) {
                setUsers(data);
            } else {
                // Initial fallback list if database is empty
                setUsers([
                    { id: '1', name: 'QRatten Admin', email: 'admin@qratten.com', role: 'ADMIN', status: 'ACTIVE', createdAt: new Date().toISOString() },
                    { id: '2', name: 'Dr. Sarah Wilson', email: 'sarah.wilson@qratten.io', role: 'TEACHER', status: 'ACTIVE', createdAt: new Date().toISOString() },
                    { id: '3', name: 'Alex Johnson', email: 'alex.j@qratten.io', role: 'STUDENT', status: 'PENDING', createdAt: new Date().toISOString() },
                    { id: '4', name: 'Emily Chen', email: 'emily.c@qratten.io', role: 'HR', status: 'ACTIVE', createdAt: new Date().toISOString() },
                ]);
            }
        } catch (err: any) {
            showToast('error', 'Fetch Error', err.message || 'Could not load users');
        } finally {
            setLoading(false);
        }
    };

    const triggerSecurityVerification = (action: () => Promise<void> | void, title?: string, desc?: string) => {
        setPendingAction(() => action);
        if (title) setVerifyTitle(title);
        if (desc) setVerifyDesc(desc);
        setIsVerifyModalOpen(true);
    };

    const handleUpdateStatus = (userId: string, status: string, userName: string) => {
        triggerSecurityVerification(async () => {
            try {
                const { error } = await adminApi.updateUser(userId, { status });
                if (error) {
                    showToast('error', 'Status Update Failed', error);
                    return;
                }
                showToast('success', 'Verified & Status Updated', `User "${userName}" status changed to ${status}.`);
                fetchUsers();
            } catch (err: any) {
                showToast('error', 'Error', err.message || 'Failed to update user status.');
            }
        }, 'Verify Status Change', `Please enter your password to change status for user "${userName}" to ${status}.`);
    };

    const handleChangeRole = () => {
        if (!selectedUserForRole) return;
        const targetUser = selectedUserForRole;
        const targetRole = newRole;

        triggerSecurityVerification(async () => {
            setIsUpdatingRole(true);
            try {
                const { error } = await adminApi.updateUser(targetUser.id, { role: targetRole });
                if (error) {
                    showToast('error', 'Role Update Failed', error);
                    return;
                }
                showToast('success', 'Verified & Role Updated', `Role for "${targetUser.name}" changed to ${targetRole}.`);
                setSelectedUserForRole(null);
                fetchUsers();
            } catch (err: any) {
                showToast('error', 'Error', err.message || 'Failed to update user role.');
            } finally {
                setIsUpdatingRole(false);
            }
        }, 'Verify Role Change', `Please enter your password to update user role for "${targetUser.name}" to ${targetRole}.`);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createName || !createEmail || !createPassword) {
            showToast('error', 'Missing Fields', 'Please fill in all required fields.');
            return;
        }

        const name = createName;
        const email = createEmail;
        const password = createPassword;
        const role = createRole;

        triggerSecurityVerification(async () => {
            setIsCreatingUser(true);
            try {
                const res = await authApi.register({ name, email, password, role });
                if (res.error) {
                    showToast('error', 'Registration Failed', res.error);
                    return;
                }
                showToast('success', 'Verified & Account Created', `Account created for ${name} with role ${role}.`);
                setIsCreateModalOpen(false);
                setCreateName('');
                setCreateEmail('');
                setCreatePassword('');
                fetchUsers();
            } catch (err: any) {
                showToast('error', 'Creation Error', err.message || 'Failed to create user account.');
            } finally {
                setIsCreatingUser(false);
            }
        }, 'Verify User Registration', `Please enter your password to authorize creating new account for "${name}".`);
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        triggerSecurityVerification(async () => {
            try {
                const { error } = await adminApi.deleteUser(userId);
                if (error) {
                    showToast('error', 'Deletion Failed', error);
                    return;
                }
                showToast('success', 'Verified & User Deleted', `Account "${userName}" has been permanently removed.`);
                fetchUsers();
            } catch (err: any) {
                showToast('error', 'Delete Error', err.message || 'Failed to delete user.');
            }
        }, 'Verify Account Deletion', `Please enter your password to confirm permanently deleting account "${userName}".`);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold px-2.5 py-0.5 rounded-full text-xs">ADMIN</Badge>;
            case 'TEACHER':
                return <Badge variant="secondary" className="bg-violet-50 text-violet-700 border border-violet-200 font-extrabold px-2.5 py-0.5 rounded-full text-xs">FACULTY / TEACHER</Badge>;
            default:
                return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded-full text-xs">STUDENT</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="success" className="font-extrabold px-2.5 py-0.5 rounded-full text-xs">ACTIVE</Badge>;
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold px-2.5 py-0.5 rounded-full text-xs">PENDING</Badge>;
            default:
                return <Badge variant="destructive" className="font-extrabold px-2.5 py-0.5 rounded-full text-xs">{status || 'SUSPENDED'}</Badge>;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN']}>
            <div className="space-y-6 animate-in fade-in duration-300 max-w-[1240px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-sm font-medium text-slate-600 mt-1">Manage accounts, roles, and security permissions across the platform</p>
                    </div>

                    <Button
                        className="gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <UserPlus size={18} />
                        Add New User
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search user by name or email..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={18} className="text-slate-400 shrink-0" />
                        <select 
                            className="bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                            <p className="text-sm font-semibold text-slate-500">Loading user database...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <Users size={48} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-700 font-bold text-base">No users found</p>
                            <p className="text-slate-500 text-xs mt-1">Try adjusting your search filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap">User</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Role</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Last Active</th>
                                        <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm shrink-0">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(user.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                                                {user.lastActive || user.createdAt ? new Date(user.lastActive || user.createdAt).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                     {user.status === 'PENDING' ? (
                                                        <Button 
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(user.id, 'ACTIVE', user.name)}
                                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold gap-1 rounded-xl h-8 px-2.5"
                                                            title="Approve User"
                                                        >
                                                            <CheckCircle2 size={14} /> Approve
                                                        </Button>
                                                    ) : user.status === 'ACTIVE' ? (
                                                        <Button 
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(user.id, 'SUSPENDED', user.name)}
                                                            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold gap-1 rounded-xl h-8 px-2.5"
                                                            title="Suspend User"
                                                        >
                                                            <Ban size={14} /> Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(user.id, 'ACTIVE', user.name)}
                                                            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold gap-1 rounded-xl h-8 px-2.5"
                                                            title="Reactivate User"
                                                        >
                                                            <UserCheck size={14} /> Reactivate
                                                        </Button>
                                                    )}

                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedUserForRole(user);
                                                            setNewRole(user.role || 'STUDENT');
                                                        }}
                                                        className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold gap-1 rounded-xl h-8 px-2.5"
                                                        title="Change Role"
                                                    >
                                                        <UserCog size={14} /> Role
                                                    </Button>

                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold gap-1 rounded-xl h-8 px-2.5"
                                                        title="Delete User"
                                                    >
                                                        <UserMinus size={14} /> Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Role Change Modal */}
            <Modal
                isOpen={!!selectedUserForRole}
                onClose={() => setSelectedUserForRole(null)}
                title="Update User Role"
            >
                {selectedUserForRole && (
                    <div className="space-y-5 py-2">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target User</p>
                            <p className="text-base font-extrabold text-slate-900 mt-0.5">{selectedUserForRole.name}</p>
                            <p className="text-xs text-slate-600 font-medium">{selectedUserForRole.email}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select New Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full bg-white border border-slate-300 text-slate-900 font-semibold rounded-xl h-11 px-3 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="STUDENT">STUDENT — Enrolled Scholar</option>
                                <option value="TEACHER">TEACHER — Faculty & Lecturer</option>
                                <option value="ADMIN">ADMIN — System Administrator</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedUserForRole(null)}
                                disabled={isUpdatingRole}
                                className="border-slate-300 text-slate-700 rounded-xl font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleChangeRole}
                                disabled={isUpdatingRole}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 px-6 rounded-xl shadow-sm gap-2"
                            >
                                {isUpdatingRole ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Saving Role...</span>
                                    </>
                                ) : (
                                    <span>Confirm Role Change</span>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isCreatingUser && setIsCreateModalOpen(false)}
                title="Create New User Account"
            >
                <form onSubmit={handleCreateUser} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                        <Input 
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="bg-white border-slate-300 text-slate-900 h-11 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                        <Input 
                            type="email"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            placeholder="e.g. john@qratten.com"
                            className="bg-white border-slate-300 text-slate-900 h-11 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Initial Password</label>
                        <Input 
                            type="password"
                            value={createPassword}
                            onChange={(e) => setCreatePassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-white border-slate-300 text-slate-900 h-11 font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Role</label>
                        <select
                            value={createRole}
                            onChange={(e) => setCreateRole(e.target.value)}
                            className="w-full bg-white border border-slate-300 text-slate-900 font-semibold rounded-xl h-11 px-3 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="STUDENT">STUDENT</option>
                            <option value="TEACHER">FACULTY / TEACHER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isCreatingUser}
                            className="border-slate-300 text-slate-700 rounded-xl font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreatingUser}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 px-6 rounded-xl shadow-sm gap-2"
                        >
                            {isCreatingUser ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Registering Account...</span>
                                </>
                            ) : (
                                <span>Create User</span>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Password Verification Modal */}
            <PasswordVerificationModal 
                isOpen={isVerifyModalOpen}
                onClose={() => { setIsVerifyModalOpen(false); setPendingAction(null); }}
                onVerified={async () => {
                    if (pendingAction) {
                        await pendingAction();
                        setPendingAction(null);
                    }
                }}
                title={verifyTitle}
                description={verifyDesc}
            />
        </RoleGuard>
    );
}
