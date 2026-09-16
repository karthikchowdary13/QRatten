'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    Briefcase,
    Users,
    Clock,
    Banknote,
    FileText,
    Filter
} from 'lucide-react';

const staffMembers = [
    { id: 1, name: 'Dr. Sarah Wilson', role: 'Faculty', attendance: '98%', status: 'ON_DUTY' },
    { id: 2, name: 'James Thompson', role: 'Security', attendance: '94%', status: 'OFF_DUTY' },
    { id: 3, name: 'Emily Chen', role: 'Admin Staff', attendance: '96%', status: 'LEAVE' },
];

import { useRouter } from 'next/navigation';

export default function HRDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">HR Management</h1>
                    <p className="text-slate-600 text-sm mt-1 font-medium">
                        Staff oversight, payroll tracking, and resource allocation.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl">
                        <Filter size={18} />
                        Filter Staff
                    </Button>
                    <Button
                        className="gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm"
                        onClick={() => router.push('/dashboard/users')}
                    >
                        <Briefcase size={18} />
                        Hire Staff
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <Users size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">84</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Across 6 departments</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Attendance</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                            <Clock size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">96.8%</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Maintain high efficiency</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Payroll</CardTitle>
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                            <Banknote size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">₹4.2M</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Processing in 4 days</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                    <CardTitle className="text-lg font-extrabold text-slate-900">Staff Attendance Directory</CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-xs">Real-time status of institution personnel</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Staff Member</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Department/Role</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Attendance Rate</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Current Status</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider text-right whitespace-nowrap">Profile</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffMembers.map((staff) => (
                                    <TableRow key={staff.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                        <TableCell className="font-bold text-slate-900 whitespace-nowrap">{staff.name}</TableCell>
                                        <TableCell className="text-slate-600 font-medium text-xs whitespace-nowrap">{staff.role}</TableCell>
                                        <TableCell className="text-slate-800 font-bold text-sm whitespace-nowrap">{staff.attendance}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant={
                                                staff.status === 'ON_DUTY' ? 'success' :
                                                    staff.status === 'LEAVE' ? 'destructive' : 'secondary'
                                            } className="font-bold px-2.5 py-0.5 rounded-full text-xs">
                                                {staff.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost" size="sm" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl"
                                                onClick={() => router.push('/dashboard/users')}
                                            >
                                                <FileText size={14} />
                                                Records
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
