'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    User,
    Heart,
    MessageSquare,
    Calendar,
    AlertTriangle,
    Download
} from 'lucide-react';

const studentProfile = {
    name: 'Alex Johnson',
    grade: '10th B',
    rollNo: '24',
    attendance: '92%',
};

const recentLogs = [
    { id: 1, date: 'Oct 24, 2023', status: 'PRESENT', remark: '-' },
    { id: 2, date: 'Oct 23, 2023', status: 'PRESENT', remark: '-' },
    { id: 3, date: 'Oct 22, 2023', status: 'PRESENT', remark: '-' },
    { id: 4, date: 'Oct 21, 2023', status: 'ABSENT', remark: 'Informed - Medical' },
];

export default function ParentDashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Parent Dashboard</h1>
                    <p className="text-slate-600 text-sm mt-1 font-medium">
                        Monitoring profile for {studentProfile.name}.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl">
                        <MessageSquare size={18} />
                        Contact Teacher
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm">
                        <Download size={18} />
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <User size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900">{studentProfile.name}</h3>
                            <p className="text-sm font-semibold text-slate-600">{studentProfile.grade} • Roll #{studentProfile.rollNo}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-1">
                        <div className="text-3xl font-extrabold text-indigo-600">{studentProfile.attendance}</div>
                        <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wellness Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-2 flex items-center gap-2">
                        <Heart size={22} className="text-rose-500 fill-rose-500" />
                        <span className="text-lg font-bold text-slate-900">Healthy</span>
                        <p className="text-xs font-medium text-slate-500 ml-auto">No medical alerts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                        <CardTitle className="text-lg font-extrabold text-slate-900">Recent Attendance History</CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-xs">Daily check-in logs for your child</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Date</TableHead>
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Status</TableHead>
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLogs.map((log) => (
                                        <TableRow key={log.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                            <TableCell className="font-bold text-slate-900 whitespace-nowrap">{log.date}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={log.status === 'PRESENT' ? 'success' : 'destructive'} className="font-bold px-2.5 py-0.5 rounded-full text-xs">
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium text-xs whitespace-nowrap">{log.remark}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                        <CardTitle className="text-lg font-extrabold text-slate-900">Academic Calendar</CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-xs">Upcoming events and holidays</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer">
                            <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-2 rounded-xl text-center min-w-[50px]">
                                <span className="block text-[10px] font-extrabold uppercase">Oct</span>
                                <span className="text-lg font-extrabold">28</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Parent-Teacher Meet</h4>
                                <p className="text-xs text-slate-500 font-medium">Virtual Meeting • 04:00 PM</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer">
                            <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 p-2 rounded-xl text-center min-w-[50px]">
                                <span className="block text-[10px] font-extrabold uppercase">Nov</span>
                                <span className="text-lg font-extrabold">05</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">Mid-Term Examinations</h4>
                                <p className="text-xs text-slate-500 font-medium">Campus Hall • 09:00 AM</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
                    <AlertTriangle size={28} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-base font-extrabold text-amber-900">Medical Notice</h3>
                    <p className="text-sm font-medium text-amber-700 mt-0.5">
                        Student was absent on Oct 21st due to medical reasons as per your notification. Please provide the certificate when they return.
                    </p>
                </div>
                <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100/80 font-bold rounded-xl">
                    Submit Documents
                </Button>
            </div>
        </div>
    );
}
