'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    QrCode,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const data = [
    { name: 'Mon', attendance: 1 },
    { name: 'Tue', attendance: 1 },
    { name: 'Wed', attendance: 0 },
    { name: 'Thu', attendance: 1 },
    { name: 'Fri', attendance: 1 },
];

const recentAttendance = [
    { id: 1, subject: 'Mathematics', teacher: 'Dr. Smith', time: '09:00 AM', status: 'PRESENT', date: 'Oct 24, 2023' },
    { id: 2, subject: 'Physics', teacher: 'Prof. Miller', time: '11:30 AM', status: 'PRESENT', date: 'Oct 24, 2023' },
    { id: 3, subject: 'Chemistry', teacher: 'Dr. Brown', time: '02:00 PM', status: 'ABSENT', date: 'Oct 23, 2023' },
    { id: 4, subject: 'English', teacher: 'Ms. Davis', time: '10:00 AM', status: 'PRESENT', date: 'Oct 23, 2023' },
];

import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-600 text-sm mt-1 font-medium">
                        Welcome back, {user?.name}. Here&apos;s your attendance overview.
                    </p>
                </div>
                <Button
                    className="gap-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm"
                    onClick={() => router.push('/dashboard/attendance')}
                >
                    <QrCode size={18} />
                    Scan QR Code
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <TrendingUp size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">85.4%</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">+2.1% from last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Present</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                            <CheckCircle2 size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">142</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Sessions marked present</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Absent</CardTitle>
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                            <XCircle size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">12</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Sessions missed</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-3">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</CardTitle>
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                            <Clock size={18} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-3xl font-extrabold text-slate-900">5</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">3 this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                        <CardTitle className="text-lg font-extrabold text-slate-900">Recent Attendance History</CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-xs">Your recent class check-in records</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Subject</TableHead>
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Date</TableHead>
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Time</TableHead>
                                        <TableHead className="text-xs uppercase font-bold text-slate-600 tracking-wider whitespace-nowrap">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAttendance.map((row) => (
                                        <TableRow key={row.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                                            <TableCell className="font-bold text-slate-900 whitespace-nowrap">
                                                <div>
                                                    {row.subject}
                                                    <p className="text-xs font-medium text-slate-500">{row.teacher}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap font-medium text-slate-600 text-xs">{row.date}</TableCell>
                                            <TableCell className="whitespace-nowrap font-medium text-slate-600 text-xs">{row.time}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={row.status === 'PRESENT' ? 'success' : 'destructive'} className="font-bold px-2.5 py-0.5 rounded-full text-xs">
                                                    {row.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                        <CardTitle className="text-lg font-extrabold text-slate-900">Weekly Activity</CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-xs">Presence trend this week</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full p-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="attendance" radius={[6, 6, 0, 0]} barSize={32}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.attendance === 1 ? '#6366f1' : '#f43f5e'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-amber-200 bg-amber-50/60 shadow-sm rounded-2xl p-6">
                <CardContent className="flex flex-col md:flex-row items-center gap-4 p-0">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-extrabold text-amber-950 text-base">Attendance Warning</h4>
                        <p className="text-xs font-semibold text-amber-800 mt-0.5">
                            Your Chemistry attendance has dropped to 72%. Maintain at least 75% to avoid exam eligibility issues.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 font-bold rounded-xl h-10 px-5 text-xs shadow-xs"
                        onClick={() => router.push('/dashboard/attendance')}
                    >
                        View Details
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
