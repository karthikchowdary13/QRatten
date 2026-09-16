'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
} from '@/components/ui';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

import {
    Building2,
    Users,
    Activity,
    ShieldCheck,
    QrCode,
    UserPlus,
    GraduationCap,
    BarChart3,
    Bell,
    Settings,
    FileText,
    ShieldAlert,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    Database,
    ArrowUpRight,
    CalendarDays,
    MoreHorizontal,
    ChevronRight,
} from 'lucide-react';


// ============================================================
// DEMO DATA
// Replace these with API data when backend endpoints are ready
// ============================================================

const institutions = [
    {
        id: 1,
        name: 'Royal Academy of Science',
        type: 'UNIVERSITY',
        students: 1250,
        status: 'ACTIVE',
    },
    {
        id: 2,
        name: 'St. Mary High School',
        type: 'SCHOOL',
        students: 850,
        status: 'ACTIVE',
    },
    {
        id: 3,
        name: 'Elite Tech Institute',
        type: 'COLLEGE',
        students: 420,
        status: 'SUSPENDED',
    },
];

const recentActivity = [
    {
        icon: UserPlus,
        title: 'New student registered',
        description: 'Arjun Mehta joined CSE-A',
        time: '10 min ago',
        type: 'blue',
    },
    {
        icon: QrCode,
        title: 'QR session started',
        description: 'Data Structures · CSE-A',
        time: '24 min ago',
        type: 'green',
    },
    {
        icon: AlertTriangle,
        title: 'Suspicious activity detected',
        description: 'Unknown device attempted attendance',
        time: '1 hour ago',
        type: 'red',
    },
    {
        icon: Users,
        title: 'Teacher account updated',
        description: 'Prof. Sarah Williams',
        time: '2 hours ago',
        type: 'purple',
    },
];

const attendanceData = [
    { day: 'Mon', value: 72 },
    { day: 'Tue', value: 81 },
    { day: 'Wed', value: 76 },
    { day: 'Thu', value: 88 },
    { day: 'Fri', value: 84 },
    { day: 'Sat', value: 91 },
    { day: 'Sun', value: 87 },
];


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export default function AdminDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const adminName = user?.name || 'QRatten Admin';

    return (
        <div className="min-h-full bg-[#f5f7fb]">

            <div className="mx-auto w-full max-w-[1600px] space-y-6 p-5 lg:p-7">

                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>

                        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                            <span>Administration</span>
                            <ChevronRight size={14} />
                            <span className="text-slate-700">
                                Dashboard
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-[#071b49]">
                            Welcome back, {adminName} 👋
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Monitor your institution, attendance, users,
                            and system activity from one place.
                        </p>

                    </div>


                    <div className="flex flex-wrap items-center gap-3">

                        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:flex">

                            <CalendarDays
                                size={17}
                                className="text-blue-600"
                            />

                            <span className="text-sm font-medium text-slate-700">
                                September 14, 2026
                            </span>

                        </div>




                    </div>

                </div>


                {/* ==================================================
                    KPI CARDS
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Institutions */}

                    <StatCard
                        title="Institutions"
                        value="24"
                        description="+3 this month"
                        icon={Building2}
                        iconStyle="bg-violet-100 text-violet-600"
                        trend="up"
                    />


                    {/* Users */}

                    <StatCard
                        title="Total Users"
                        value="18,420"
                        description="1,204 active now"
                        icon={Users}
                        iconStyle="bg-blue-100 text-blue-600"
                        trend="up"
                    />


                    {/* Attendance */}

                    <StatCard
                        title="Today's Attendance"
                        value="87.4%"
                        description="+2.4% from yesterday"
                        icon={Activity}
                        iconStyle="bg-emerald-100 text-emerald-600"
                        trend="up"
                    />


                    {/* Security */}

                    <StatCard
                        title="Security Alerts"
                        value="03"
                        description="Requires attention"
                        icon={ShieldAlert}
                        iconStyle="bg-orange-100 text-orange-600"
                        trend="warning"
                    />

                </div>


                {/* ==================================================
                    ANALYTICS ROW
                ================================================== */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">


                    {/* ATTENDANCE ANALYTICS */}

                    <Card
                        className="
                            overflow-hidden
                            rounded-2xl
                            border-slate-200/80
                            bg-white
                            shadow-sm
                        "
                    >

                        <CardHeader className="flex flex-row items-center justify-between">

                            <div>

                                <CardTitle className="flex items-center gap-2 text-lg text-[#071b49]">

                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <BarChart3 size={18} />
                                    </span>

                                    Attendance Overview

                                </CardTitle>

                                <CardDescription className="mt-1">
                                    Institution-wide attendance for the last 7 days
                                </CardDescription>

                            </div>


                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden rounded-lg sm:flex"
                                onClick={() =>
                                    router.push('/admin/reports')
                                }
                            >
                                View Reports
                                <ArrowUpRight size={15} />
                            </Button>

                        </CardHeader>


                        <CardContent>

                            <div className="h-[245px] w-full">

                                <div className="relative h-[205px]">

                                    {/* Grid */}

                                    <div className="absolute inset-0 flex flex-col justify-between">

                                        {[100, 75, 50, 25, 0].map(
                                            (value) => (
                                                <div
                                                    key={value}
                                                    className="flex items-center gap-3"
                                                >

                                                    <span className="w-8 text-right text-[11px] text-slate-400">
                                                        {value}%
                                                    </span>

                                                    <div className="h-px flex-1 bg-slate-100" />

                                                </div>
                                            )
                                        )}

                                    </div>


                                    {/* Chart */}

                                    <div className="absolute bottom-0 left-12 right-0 top-0">

                                        <svg
                                            viewBox="0 0 700 200"
                                            preserveAspectRatio="none"
                                            className="h-full w-full"
                                        >

                                            <defs>

                                                <linearGradient
                                                    id="attendanceFill"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >

                                                    <stop
                                                        offset="0%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity="0.22"
                                                    />

                                                    <stop
                                                        offset="100%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity="0"
                                                    />

                                                </linearGradient>

                                            </defs>


                                            {/* Area */}

                                            <path
                                                d="
                                                    M 0 88
                                                    L 116 62
                                                    L 233 78
                                                    L 350 45
                                                    L 466 56
                                                    L 583 25
                                                    L 700 42
                                                    L 700 200
                                                    L 0 200
                                                    Z
                                                "
                                                fill="url(#attendanceFill)"
                                            />


                                            {/* Line */}

                                            <path
                                                d="
                                                    M 0 88
                                                    L 116 62
                                                    L 233 78
                                                    L 350 45
                                                    L 466 56
                                                    L 583 25
                                                    L 700 42
                                                "
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />


                                            {/* Points */}

                                            {[
                                                [0, 88],
                                                [116, 62],
                                                [233, 78],
                                                [350, 45],
                                                [466, 56],
                                                [583, 25],
                                                [700, 42],
                                            ].map(([cx, cy], index) => (

                                                <circle
                                                    key={index}
                                                    cx={cx}
                                                    cy={cy}
                                                    r="4.5"
                                                    fill="white"
                                                    stroke="#3b82f6"
                                                    strokeWidth="3"
                                                />

                                            ))}

                                        </svg>

                                    </div>

                                </div>


                                {/* Days */}

                                <div className="ml-12 flex justify-between">

                                    {attendanceData.map((item) => (
                                        <span
                                            key={item.day}
                                            className="text-xs text-slate-400"
                                        >
                                            {item.day}
                                        </span>
                                    ))}

                                </div>

                            </div>

                        </CardContent>

                    </Card>


                    {/* SYSTEM HEALTH */}

                    <Card
                        className="
                            rounded-2xl
                            border-slate-200/80
                            bg-white
                            shadow-sm
                        "
                    >

                        <CardHeader>

                            <CardTitle className="flex items-center gap-2 text-lg text-[#071b49]">

                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={18} />
                                </span>

                                System Health

                            </CardTitle>

                            <CardDescription>
                                Current platform service status
                            </CardDescription>

                        </CardHeader>


                        <CardContent className="space-y-5">

                            <HealthItem
                                icon={Database}
                                label="Database"
                                value="Operational"
                                percentage="99.99%"
                            />

                            <HealthItem
                                icon={QrCode}
                                label="QR Attendance Service"
                                value="Operational"
                                percentage="99.98%"
                            />

                            <HealthItem
                                icon={Activity}
                                label="API Services"
                                value="Operational"
                                percentage="99.97%"
                            />

                            <HealthItem
                                icon={Bell}
                                label="Notification Service"
                                value="Operational"
                                percentage="99.95%"
                            />


                            <div className="mt-2 rounded-xl bg-emerald-50 p-3">

                                <div className="flex items-center gap-2">

                                    <CheckCircle2
                                        size={17}
                                        className="text-emerald-600"
                                    />

                                    <span className="text-sm font-semibold text-emerald-700">
                                        All systems operational
                                    </span>

                                </div>

                                <p className="mt-1 pl-6 text-xs text-emerald-600/80">
                                    Last system check completed recently.
                                </p>

                            </div>

                        </CardContent>

                    </Card>

                </div>


                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <Card
                    className="
                        rounded-2xl
                        border-slate-200/80
                        bg-white
                        shadow-sm
                    "
                >

                    <CardHeader>

                        <CardTitle className="text-lg text-[#071b49]">
                            Quick Actions
                        </CardTitle>

                        <CardDescription>
                            Manage frequently used administrative functions.
                        </CardDescription>

                    </CardHeader>


                    <CardContent>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                            <QuickAction
                                icon={UserPlus}
                                title="Add User"
                                description="Create account"
                                className="bg-blue-50 text-blue-600"
                                onClick={() =>
                                    router.push('/admin/users')
                                }
                            />

                            <QuickAction
                                icon={Building2}
                                title="Institutions"
                                description="Manage institutions"
                                className="bg-violet-50 text-violet-600"
                                onClick={() =>
                                    router.push('/admin/institutions')
                                }
                            />

                            <QuickAction
                                icon={QrCode}
                                title="Attendance"
                                description="Manage QR sessions"
                                className="bg-emerald-50 text-emerald-600"
                                onClick={() =>
                                    router.push('/admin/attendance')
                                }
                            />

                            <QuickAction
                                icon={BarChart3}
                                title="Reports"
                                description="View analytics"
                                className="bg-orange-50 text-orange-600"
                                onClick={() =>
                                    router.push('/admin/reports')
                                }
                            />

                            <QuickAction
                                icon={ShieldAlert}
                                title="Security"
                                description="Review threats"
                                className="bg-red-50 text-red-600"
                                onClick={() =>
                                    router.push('/admin/audit-logs')
                                }
                            />

                            <QuickAction
                                icon={Settings}
                                title="Settings"
                                description="System settings"
                                className="bg-slate-100 text-slate-600"
                                onClick={() =>
                                    router.push('/admin/settings')
                                }
                            />

                        </div>

                    </CardContent>

                </Card>


                {/* ==================================================
                    BOTTOM SECTION
                ================================================== */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(350px,1fr)]">


                    {/* INSTITUTIONS */}

                    <Card
                        className="
                            overflow-hidden
                            rounded-2xl
                            border-slate-200/80
                            bg-white
                            shadow-sm
                        "
                    >

                        <CardHeader className="flex flex-row items-center justify-between">

                            <div>

                                <CardTitle className="text-lg text-[#071b49]">
                                    Institutions
                                </CardTitle>

                                <CardDescription>
                                    Registered educational institutions
                                </CardDescription>

                            </div>


                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() =>
                                    router.push('/admin/institutions')
                                }
                            >
                                View All
                            </Button>

                        </CardHeader>


                        <CardContent>

                            <div className="overflow-x-auto">

                                <Table>

                                    <TableHeader>

                                        <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">

                                            <TableHead>
                                                Institution
                                            </TableHead>

                                            <TableHead>
                                                Type
                                            </TableHead>

                                            <TableHead>
                                                Students
                                            </TableHead>

                                            <TableHead>
                                                Status
                                            </TableHead>

                                            <TableHead className="text-right">
                                                Action
                                            </TableHead>

                                        </TableRow>

                                    </TableHeader>


                                    <TableBody>

                                        {institutions.map((institution) => (

                                            <TableRow key={institution.id}>

                                                <TableCell>

                                                    <div className="flex items-center gap-3">

                                                        <div
                                                            className="
                                                                flex
                                                                h-9
                                                                w-9
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-lg
                                                                bg-blue-50
                                                                text-blue-600
                                                            "
                                                        >
                                                            <Building2 size={17} />
                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-slate-800">
                                                                {institution.name}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                ID #{institution.id.toString().padStart(4, '0')}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </TableCell>


                                                <TableCell>

                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-lg bg-slate-100 text-xs font-medium text-slate-600"
                                                    >
                                                        {institution.type}
                                                    </Badge>

                                                </TableCell>


                                                <TableCell className="font-medium text-slate-700">

                                                    {institution.students.toLocaleString()}

                                                </TableCell>


                                                <TableCell>

                                                    {institution.status === 'ACTIVE' ? (

                                                        <Badge
                                                            variant="success"
                                                            className="gap-1 rounded-full bg-emerald-50 text-emerald-600"
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Active
                                                        </Badge>

                                                    ) : (

                                                        <Badge
                                                            variant="destructive"
                                                            className="rounded-full"
                                                        >
                                                            Suspended
                                                        </Badge>

                                                    )}

                                                </TableCell>


                                                <TableCell className="text-right">

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-blue-600 hover:text-blue-700"
                                                        onClick={() =>
                                                            router.push('/admin/institutions')
                                                        }
                                                    >
                                                        Manage
                                                        <ChevronRight size={14} />
                                                    </Button>

                                                </TableCell>

                                            </TableRow>

                                        ))}

                                    </TableBody>

                                </Table>

                            </div>

                        </CardContent>

                    </Card>


                    {/* RECENT ACTIVITY */}

                    <Card
                        className="
                            rounded-2xl
                            border-slate-200/80
                            bg-white
                            shadow-sm
                        "
                    >

                        <CardHeader className="flex flex-row items-center justify-between">

                            <div>

                                <CardTitle className="text-lg text-[#071b49]">
                                    Recent Activity
                                </CardTitle>

                                <CardDescription>
                                    Latest system events
                                </CardDescription>

                            </div>


                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg"
                                onClick={() =>
                                    router.push('/admin/audit-logs')
                                }
                            >
                                <MoreHorizontal size={19} />
                            </Button>

                        </CardHeader>


                        <CardContent>

                            <div className="space-y-5">

                                {recentActivity.map((activity, index) => {

                                    const Icon = activity.icon;

                                    const iconClasses: Record<string, string> = {
                                        blue: 'bg-blue-50 text-blue-600',
                                        green: 'bg-emerald-50 text-emerald-600',
                                        red: 'bg-red-50 text-red-600',
                                        purple: 'bg-violet-50 text-violet-600',
                                    };

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3"
                                        >

                                            <div
                                                className={`
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    ${iconClasses[activity.type]}
                                                `}
                                            >
                                                <Icon size={17} />
                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {activity.title}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {activity.description}
                                                </p>

                                            </div>


                                            <span className="shrink-0 text-[11px] text-slate-400">
                                                {activity.time}
                                            </span>

                                        </div>
                                    );

                                })}

                            </div>


                            <Button
                                variant="outline"
                                className="mt-6 w-full rounded-xl"
                                onClick={() =>
                                    router.push('/admin/audit-logs')
                                }
                            >
                                View Audit Log
                                <ArrowUpRight size={15} />
                            </Button>

                        </CardContent>

                    </Card>

                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="flex flex-col gap-2 border-t border-slate-200/70 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                    <p>
                        © 2026 QRatten · Institutional Attendance Management
                    </p>

                    <div className="flex items-center gap-4">

                        <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            All systems operational
                        </span>

                        <span>v1.0.0</span>

                    </div>

                </div>

            </div>

        </div>
    );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconStyle,
    trend,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    iconStyle: string;
    trend: 'up' | 'warning';
}) {
    return (
        <Card
            className="
                rounded-2xl
                border-slate-200/80
                bg-white
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-md
            "
        >

            <CardContent className="p-5">

                <div className="flex items-start justify-between">

                    <div
                        className={`
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            ${iconStyle}
                        `}
                    >
                        <Icon size={21} />
                    </div>


                    {trend === 'up' ? (

                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                            <ArrowUpRight size={12} />
                            Growing
                        </span>

                    ) : (

                        <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-600">
                            <AlertTriangle size={11} />
                            Attention
                        </span>

                    )}

                </div>


                <div className="mt-4">

                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-1 text-3xl font-bold tracking-tight text-[#071b49]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>

                </div>

            </CardContent>

        </Card>
    );
}


// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
    icon: Icon,
    title,
    description,
    className,
    onClick,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    className: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group
                flex
                min-h-[105px]
                flex-col
                items-start
                justify-between
                rounded-2xl
                border
                border-transparent
                bg-slate-50
                p-4
                text-left
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-slate-200
                hover:bg-white
                hover:shadow-sm
            "
        >

            <div
                className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    ${className}
                `}
            >
                <Icon size={18} />
            </div>


            <div>

                <p className="text-sm font-semibold text-slate-800">
                    {title}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                    {description}
                </p>

            </div>

        </button>
    );
}


// ============================================================
// SYSTEM HEALTH
// ============================================================

function HealthItem({
    icon: Icon,
    label,
    value,
    percentage,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    percentage: string;
}) {
    return (
        <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon size={17} />
            </div>


            <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-2">

                    <p className="truncate text-sm font-medium text-slate-700">
                        {label}
                    </p>

                    <span className="shrink-0 text-xs font-semibold text-emerald-600">
                        {percentage}
                    </span>

                </div>

                <div className="mt-1 flex items-center gap-2">

                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">

                        <span
                            className="
                                block
                                h-full
                                w-[99%]
                                rounded-full
                                bg-emerald-500
                            "
                        />

                    </span>

                    <span className="text-[10px] text-slate-400">
                        {value}
                    </span>

                </div>

            </div>

        </div>
    );
}


// ============================================================
// SMALL PLUS ICON
// ============================================================

function PlusIcon() {
    return (
        <span className="text-lg leading-none">
            +
        </span>
    );
}