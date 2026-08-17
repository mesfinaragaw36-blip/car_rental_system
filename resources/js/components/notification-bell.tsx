import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { index, readAll, read } from '@/routes/notifications';

interface SharedNotifications {
    unread_count?: number;
    latest?: {
        id: number;
        type: string;
        title: string;
        message: string;
        read_at: string | null;
        created_at: string;
        url: string | null;
    }[];
}

export function NotificationBell() {
    const pageProps = usePage().props as Record<string, unknown>;
    const shared = (pageProps.sharedNotifications ?? pageProps.notifications) as SharedNotifications | undefined;

    const unreadCount = shared?.unread_count ?? 0;
    const latest = shared?.latest ?? [];

    const handleMarkRead = (id: number) => {
        router.post(read.url({ notification: id }), undefined, {
            preserveScroll: true,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 cursor-pointer"
                    aria-label="Notifications"
                >
                    <Bell className="size-5 opacity-80 group-hover:opacity-100" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between pr-1">
                    <DropdownMenuLabel className="text-sm font-semibold">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-accent hover:text-foreground"
                            onClick={() =>
                                router.post(readAll.url(), undefined, {
                                    preserveScroll: true,
                                })
                            }
                        >
                            <Check className="size-3" />
                            Mark all read
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {latest.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                        <Inbox className="size-8 text-neutral-400" />
                        <p className="text-sm text-neutral-500">
                            You&apos;re all caught up.
                        </p>
                    </div>
                ) : (
                    latest.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={cn(
                                'flex cursor-pointer items-start gap-3 px-3 py-2.5',
                                !notification.read_at && 'bg-accent/50',
                            )}
                            onClick={() => handleMarkRead(notification.id)}
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {notification.title}
                                </p>
                                <p className="line-clamp-2 text-xs text-neutral-500">
                                    {notification.message}
                                </p>
                                <p className="mt-1 text-[11px] text-neutral-400">
                                    {notification.created_at}
                                </p>
                            </div>
                            {!notification.read_at && (
                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                            )}
                        </DropdownMenuItem>
                    ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full cursor-pointer justify-center text-sm font-medium"
                        href={index.url()}
                    >
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
