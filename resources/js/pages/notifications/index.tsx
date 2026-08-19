import { Head, router, usePage } from '@inertiajs/react';
import {
    Ban,
    Banknote,
    Bell,
    Car,
    Check,
    CheckCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Inbox,
    KeyRound,
    Lock,
    ShieldAlert,
    TriangleAlert,
    Truck,
    Undo2,
    Wallet,
    XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index, read, readAll } from '@/routes/notifications';

interface AppNotification {
    id: number;
    type: string;
    title: string;
    message: string;
    related_type: string | null;
    related_id: number | null;
    read_at: string | null;
    created_at: string;
    created_at_iso: string;
    url: string | null;
}

interface Props {
    notifications: {
        data: AppNotification[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    unread_count: number;
}

type Filter = 'all' | 'unread' | 'read';

const TYPE_META: Record<
    string,
    {
        icon: LucideIcon;
        tone: string;
        label: string;
    }
> = {
    booking_locked: {
        icon: Lock,
        tone: 'bg-accent text-primary',
        label: 'Booking locked',
    },

    car_arrived: {
        icon: Truck,
        tone: 'bg-emerald-50 text-emerald-600',
        label: 'Car arrived',
    },

    car_delivery_failed: {
        icon: TriangleAlert,
        tone: 'bg-red-50 text-red-600',
        label: 'Delivery failed',
    },

    car_ready: {
        icon: Car,
        tone: 'bg-emerald-50 text-emerald-600',
        label: 'Car ready',
    },

    inspection_approved: {
        icon: CheckCircle2,
        tone: 'bg-emerald-50 text-emerald-600',
        label: 'Inspection approved',
    },

    inspection_failed: {
        icon: XCircle,
        tone: 'bg-red-50 text-red-600',
        label: 'Inspection failed',
    },

    booking_cancelled: {
        icon: Ban,
        tone: 'bg-red-50 text-red-600',
        label: 'Booking cancelled',
    },

    booking_paid: {
        icon: Wallet,
        tone: 'bg-accent text-primary',
        label: 'Payment received',
    },

    configuration_approved: {
        icon: CheckCircle2,
        tone: 'bg-emerald-50 text-emerald-600',
        label: 'Configuration approved',
    },

    configuration_rejected: {
        icon: XCircle,
        tone: 'bg-red-50 text-red-600',
        label: 'Configuration rejected',
    },

    booking_picked_up: {
        icon: KeyRound,
        tone: 'bg-accent text-primary',
        label: 'Vehicle picked up',
    },

    booking_returned: {
        icon: Undo2,
        tone: 'bg-accent text-primary',
        label: 'Vehicle returned',
    },

    booking_completed: {
        icon: CheckCheck,
        tone: 'bg-emerald-50 text-emerald-600',
        label: 'Booking completed',
    },

    payout_pending: {
        icon: Banknote,
        tone: 'bg-amber-50 text-amber-600',
        label: 'Payout pending',
    },

    delivery_escalated: {
        icon: ShieldAlert,
        tone: 'bg-orange-50 text-orange-600',
        label: 'Escalated',
    },
};

function typeMeta(type: string) {
    return (
        TYPE_META[type] ?? {
            icon: Bell,
            tone: 'bg-slate-100 text-slate-600',
            label: 'Notification',
        }
    );
}

function dayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );

    const diffDays = Math.round(
        (startOfToday.getTime() - startOfDay.getTime()) / 86400000,
    );

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year:
            date.getFullYear() === today.getFullYear()
                ? undefined
                : 'numeric',
    });
}

function NotificationRow({
    notification,
}: {
    notification: AppNotification;
}) {
    const meta = typeMeta(notification.type);
    const Icon = meta.icon;
    const unread = !notification.read_at;

    const handleClick = () => {
        if (unread) {
            router.post(
                read.url({
                    notification: notification.id,
                }),
                undefined,
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        if (notification.url) {
                            router.visit(notification.url);
                        }
                    },
                },
            );

            return;
        }

        if (notification.url) {
            router.visit(notification.url);
        }
    };

    const markRead = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        event.stopPropagation();

        if (unread) {
            router.post(
                read.url({
                    notification: notification.id,
                }),
                undefined,
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <div
            className={cn(
                'group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200',
                unread
                    ? 'border-primary/10 bg-primary/[0.025] shadow-sm hover:border-primary/20 hover:bg-primary/[0.04]'
                    : 'border-slate-200/70 bg-white/45 hover:border-slate-300 hover:bg-white/65',
            )}
            onClick={handleClick}
        >
            <div
                className={cn(
                    'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    meta.tone,
                )}
            >
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                        className={cn(
                            'text-sm text-slate-900',
                            unread ? 'font-bold' : 'font-semibold',
                        )}
                    >
                        {notification.title}
                    </p>

                    <span className="shrink-0 text-xs text-slate-400">
                        {notification.created_at}
                    </span>
                </div>

                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {notification.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            meta.tone,
                        )}
                    >
                        {meta.label}
                    </span>

                    {unread && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            New
                        </span>
                    )}

                    {unread && (
                        <button
                            type="button"
                            onClick={markRead}
                            className="text-xs font-medium text-slate-400 opacity-0 transition-opacity hover:text-slate-700 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                        >
                            Mark as read
                        </button>
                    )}
                </div>
            </div>

            {unread && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
        </div>
    );
}

export default function NotificationsIndex({
    notifications,
    unread_count: unreadCount,
}: Props) {
    const { props } = usePage<{
        flash?: {
            toast?: {
                type: 'success' | 'error';
                message: string;
            };
        };
    }>();

    const toast = props.flash?.toast;

    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(() => {
        const items = notifications.data;

        if (filter === 'unread') {
            return items.filter((item) => !item.read_at);
        }

        if (filter === 'read') {
            return items.filter((item) => item.read_at);
        }

        return items;
    }, [filter, notifications.data]);

    const groups = useMemo(() => {
        const map = new Map<string, AppNotification[]>();

        for (const item of filtered) {
            const label = dayLabel(item.created_at_iso);
            const bucket = map.get(label) ?? [];

            bucket.push(item);
            map.set(label, bucket);
        }

        return Array.from(map.entries());
    }, [filtered]);

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        const page = new URL(url).searchParams.get('page');

        router.get(
            index.url({
                query: {
                    page: page ?? '1',
                },
            }),
            undefined,
            {
                preserveScroll: true,
            },
        );
    };

    const tabs: {
        key: Filter;
        label: string;
    }[] = [
        {
            key: 'all',
            label: 'All',
        },
        {
            key: 'unread',
            label: `Unread (${unreadCount})`,
        },
        {
            key: 'read',
            label: 'Read',
        },
    ];

    return (
        <>
            <Head title="Notifications" />

            <div className="min-h-full space-y-7 bg-background p-6">
                {/* Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Notifications
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Stay updated with your bookings, payments,
                                    vehicles, and inspections.
                                </p>
                            </div>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            className="border-primary/15 bg-white/60 shadow-sm hover:bg-white"
                            onClick={() =>
                                router.post(
                                    readAll.url(),
                                    undefined,
                                    {
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            <CheckCheck className="mr-2 h-4 w-4 text-primary" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Total
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {notifications.total}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                <Inbox className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-primary/10 bg-primary/[0.035] p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Unread
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {unreadCount}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/35 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Read
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {Math.max(
                                        0,
                                        notifications.total - unreadCount,
                                    )}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                <Check className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={cn(
                            'rounded-xl border px-4 py-3 text-sm font-medium shadow-sm',
                            toast.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-red-200 bg-red-50 text-red-800',
                        )}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/70 bg-white/45 p-1.5">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.key}
                                size="sm"
                                variant={
                                    filter === tab.key
                                        ? 'default'
                                        : 'ghost'
                                }
                                className={cn(
                                    'rounded-lg',
                                    filter !== tab.key &&
                                        'text-slate-500 hover:bg-white/70 hover:text-slate-900',
                                )}
                                onClick={() => setFilter(tab.key)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {filtered.length > 0 && (
                        <p className="text-xs font-medium text-slate-400">
                            Showing {filtered.length} notification
                            {filtered.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Notifications */}
                {groups.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/30 py-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                            <Inbox className="h-7 w-7 text-slate-400" />
                        </div>

                        <p className="mt-5 text-lg font-semibold text-slate-800">
                            {filter === 'all'
                                ? 'No notifications yet.'
                                : `No ${filter} notifications.`}
                        </p>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                            Booking, payment, vehicle, and inspection updates
                            will appear here when there is something new to
                            show you.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-7">
                        {groups.map(([label, items]) => (
                            <section key={label}>
                                <div className="mb-3 flex items-center gap-3">
                                    <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                        {label}
                                    </h2>

                                    <div className="h-px flex-1 bg-slate-200/70" />
                                </div>

                                <div className="space-y-2.5">
                                    {items.map((notification) => (
                                        <NotificationRow
                                            key={notification.id}
                                            notification={notification}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/45 p-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/60"
                            disabled={!notifications.prev_page_url}
                            onClick={() =>
                                goToPage(
                                    notifications.prev_page_url,
                                )
                            }
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>

                        <span className="text-sm font-medium text-slate-500">
                            Page {notifications.current_page} of{' '}
                            {notifications.last_page}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/60"
                            disabled={!notifications.next_page_url}
                            onClick={() =>
                                goToPage(
                                    notifications.next_page_url,
                                )
                            }
                        >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Notifications',
            href: '/notifications',
        },
    ],
};