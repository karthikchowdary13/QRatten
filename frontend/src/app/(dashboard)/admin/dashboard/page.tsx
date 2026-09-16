'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    Shield,
    Building2,
    Users,
    Activity,
    Lock,
    Plus
} from 'lucide-react';

const institutions = [
    { id: 1, name: 'Royal Academy of Science', type: 'UNIVERSITY', students: 1250, status: 'ACTIVE' },
    { id: 2, name: 'St. Mary High School', type: 'SCHOOL', students: 850, status: 'ACTIVE' },
    { id: 3, name: 'Elite Tech Institute', type: 'COLLEGE', students: 420, status: 'SUSPENDED' },
];

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
                    <p className="text-slate-600 text-sm mt-1 font-medium">
                        Global orchestration and infrastructure monitoring.
                    </p>
                </div>
                <Button
                    className="gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm"
                    onClick={() => router.push('/admin/institutions')}
                >
                    <Plus size={18} />
                    Register Institution
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutions</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <Building2 size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">24</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Across 12 regions</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                            <Users size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">18.4K</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">1.2K active now</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</CardTitle>
                        <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                            <Activity size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">99.9%</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">All services operational</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Threats</CardTitle>
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                            <Shield size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">0</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Scan completed 2m ago</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                    <CardTitle className="text-lg font-extrabold text-slate-900">Institutions Directory</CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-xs">Management of registered educational bodies</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Institution Name</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Type</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Total Students</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Status</TableHead>
                                    <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider text-right whitespace-nowrap">Orchestration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {institutions.map((inst) => (
                                    <TableRow key={inst.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                        <TableCell className="font-bold text-slate-900 whitespace-nowrap">{inst.name}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold border border-slate-200 text-xs px-2.5 py-0.5 rounded-full">{inst.type}</Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-slate-700 font-semibold text-sm">{inst.students.toLocaleString()}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant={inst.status === 'ACTIVE' ? 'success' : 'destructive'} className="font-bold px-2.5 py-0.5 rounded-full text-xs">
                                                {inst.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                                            <Button variant="outline" size="sm" className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold" onClick={() => router.push('/admin/institutions')}>Manage</Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-600"><Lock size={14} /></Button>
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
