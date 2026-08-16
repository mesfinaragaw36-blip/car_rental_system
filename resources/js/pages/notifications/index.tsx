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
    { icon: LucideIcon; tone: string; label: string }
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
            date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
    });
}

function NotificationRow({ notification }: { notification: AppNotification }) {
    const meta = typeMeta(notification.type);
    const Icon = meta.icon;
    const unread = !notification.read_at;

    const handleClick = () => {
        if (unread) {
            router.post(read({ notification: notification.id }), undefined, {
                preserveScroll: true,
                onSuccess: () => {
                    if (notification.url) {
                        router.visit(notification.url);
                    }
                },
            });

            return;
        }

        if (notification.url) {
            router.visit(notification.url);
        }
    };

    const markRead = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (unread) {
            router.post(read({ notification: notification.id }), undefined, {
                preserveScroll: true,
            });
        }
    };

    return (
        <div
            className="group flex cursor-pointer items-start gap-4 py-4"
            onClick={handleClick}
        >
            <div
                className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    meta.tone,
                )}
            >
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                        className={cn(
                            'text-sm',
                            unread ? 'font-semibold' : 'font-medium',
                        )}
                    >
                        {notification.title}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {notification.created_at}
                    </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    {notification.message}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                            meta.tone,
                        )}
                    >
                        {meta.label}
                    </span>
                    {unread && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            New
                        </span>
                    )}
                    {unread && (
                        <button
                            type="button"
                            onClick={markRead}
                            className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none"
                        >
                            Mark as read
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function NotificationsIndex({
    notifications,
    unread_count: unreadCount,
}: Props) {
    const { props } = usePage<{
        flash?: { toast?: { type: 'success' | 'error'; message: string } };
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

        router.get(index({ query: { page: page ?? '1' } }), undefined, {
            preserveScroll: true,
        });
    };

    const tabs: { key: Filter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: `Unread (${unreadCount})` },
        { key: 'read', label: 'Read' },
    ];

    return (
        <>
            <Head title="Notifications" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="mt-2 text-muted-foreground">
                            Updates about your bookings, payments, vehicles, and
                            inspections.
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.post(readAll(), undefined, {
                                    preserveScroll: true,
                                })
                            }
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {toast && (
                    <div
                        className={cn(
                            'rounded-lg px-4 py-3 text-sm font-medium',
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800',
                        )}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.key}
                            size="sm"
                            variant={filter === tab.key ? 'default' : 'ghost'}
                            onClick={() => setFilter(tab.key)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {groups.length === 0 ? (
                    <div className="py-16 text-center">
                        <Inbox className="mx-auto h-12 w-12 text-neutral-400" />
                        <p className="mt-4 text-lg font-semibold">
                            {filter === 'all'
                                ? 'No notifications yet.'
                                : `No ${filter} notifications.`}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Booking, payment, and inspection updates will appear
                            here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groups.map(([label, items]) => (
                            <div key={label}>
                                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    {label}
                                </h2>
                                <div className="divide-y divide-slate-200">
                                    {items.map((notification) => (
                                        <NotificationRow
                                            key={notification.id}
                                            notification={notification}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!notifications.prev_page_url}
                            onClick={() =>
                                goToPage(notifications.prev_page_url)
                            }
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {notifications.current_page} of{' '}
                            {notifications.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!notifications.next_page_url}
                            onClick={() =>
                                goToPage(notifications.next_page_url)
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
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Notifications', href: '/notifications' },
    ],
};
