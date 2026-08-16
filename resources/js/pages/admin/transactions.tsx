import { Head, router, usePage } from '@inertiajs/react';
import { Eye, Banknote, Wallet, CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCan } from '@/hooks/use-can';

type TransactionType = 'payment' | 'refund' | 'owner_payout' | 'driver_payout';

type Transaction = {
    type: TransactionType;
    id: number;
    booking_id: number;
    amount: string;
    status: string;
    status_at: string | null;
    created_at: string;
    customer: string | null;
    owner: string | null;
    driver: string | null;
    car: string | null;
    plate_number: string | null;
    reason: string | null;
    gross_amount: string | null;
    commission_amount: string | null;
    net_amount: string | null;
    earnings: string | null;
    payment_type: string | null;
    payment_method: string | null;
    transaction_reference: string | null;
    booking: {
        pickup_date: string | null;
        return_date: string | null;
        pickup_location: string | null;
        return_location: string | null;
        need_driver: boolean;
        total_price: string;
        status: string;
    } | null;
};

interface Paginated {
    data: Transaction[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    total: number;
}

interface Props {
    transactions: Paginated;
    filters: {
        type?: string;
    };
    summary?: {
        total_transactions: number;
        total_company_earnings: string;
        total_amount: string;
    };
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

const TYPE_LABELS: Record<TransactionType, string> = {
    payment: 'Payment',
    refund: 'Refund',
    owner_payout: 'Owner Payout',
    driver_payout: 'Driver Payout',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
    booking_deposit: 'Booking Deposit',
    balance: 'Balance',
    security_deposit: 'Security Deposit',
    extra_charge: 'Extra Charge',
};

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-brand-soft text-brand',
    paid: 'bg-green-100 text-green-800',
    processed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
};

const TABS: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'payment', label: 'Payments' },
    { value: 'refund', label: 'Refunds' },
    { value: 'owner_payout', label: 'Owner' },
    { value: 'driver_payout', label: 'Driver' },
];

const ACTION_LABELS: Record<
    'refund' | 'owner_payout' | 'driver_payout',
    string
> = {
    refund: 'Refund',
    owner_payout: 'Pay Owner',
    driver_payout: 'Pay Driver',
};

export default function AdminTransactions({
    transactions,
    filters,
    summary,
}: Props) {
    const { props } = usePage<{ flash?: FlashProps }>();

    const toast = props.flash?.toast;
    const can = useCan();

    const type = filters.type ?? 'all';

    const [selected, setSelected] = useState<Transaction | null>(null);

    function selectType(value: string) {
        router.get(
            '/admin/transactions',
            {
                type: value === 'all' ? undefined : value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function isCashPayment(transaction: Transaction): boolean {
        return (
            transaction.type === 'payment' &&
            transaction.payment_method?.toLowerCase() === 'cash'
        );
    }

    function isPendingCashPayment(transaction: Transaction): boolean {
        return isCashPayment(transaction) && transaction.status === 'pending';
    }

    function confirmCashPayment(transaction: Transaction) {
        if (!isPendingCashPayment(transaction)) {
            return;
        }

        if (
            !confirm(
                `Confirm that ETB ${transaction.amount} cash payment for booking #${transaction.booking_id} has been received?`,
            )
        ) {
            return;
        }

        /*
         * IMPORTANT:
         * The backend route is:
         *
         * POST /payments/{payment}/confirm
         *
         * Route name:
         * payments.confirm
         *
         * Do NOT use:
         * /admin/transactions/payments/{id}/confirm-cash
         */
        router.post(
            `/payments/${transaction.id}/confirm`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected(null);
                },
            },
        );
    }

    function handleAction(transaction: Transaction) {
        if (transaction.type === 'payment') {
            if (isPendingCashPayment(transaction)) {
                confirmCashPayment(transaction);
            }

            return;
        }

        const id = transaction.id;

        if (transaction.type === 'refund') {
            if (confirm('Mark this refund as processed?')) {
                router.post(
                    `/admin/transactions/refunds/${id}/process`,
                    {},
                    {
                        preserveScroll: true,
                    },
                );
            }

            return;
        }

        if (confirm('Confirm this payout was transferred?')) {
            const endpoint =
                transaction.type === 'owner_payout'
                    ? `/admin/transactions/owner-payouts/${id}/mark-paid`
                    : `/admin/transactions/driver-payouts/${id}/mark-paid`;

            router.post(
                endpoint,
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    }

    function dateLabel(transaction: Transaction): string {
        return transaction.status_at ?? transaction.created_at;
    }

    function partyLabel(transaction: Transaction): string {
        if (transaction.type === 'payment' || transaction.type === 'refund') {
            return transaction.customer ?? '—';
        }

        if (transaction.type === 'owner_payout') {
            return transaction.owner ?? '—';
        }

        return transaction.driver ?? '—';
    }

    function vehicleLabel(transaction: Transaction): string {
        if (!transaction.car) {
            return '—';
        }

        return transaction.plate_number
            ? `${transaction.car} (${transaction.plate_number})`
            : transaction.car;
    }

    return (
        <>
            <Head title="Transactions" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>

                    <p className="text-muted-foreground">
                        View customer payments, refunds, owner payouts, and
                        driver payouts in one place.
                    </p>
                </div>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Transactions
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-2xl font-bold">
                                {summary?.total_transactions ?? 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Company Commission
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">
                                ETB {summary?.total_company_earnings ?? '0.00'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Amount
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-2xl font-bold">
                                ETB {summary?.total_amount ?? '0.00'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <nav className="flex flex-wrap gap-2">
                            {TABS.map((tab) => (
                                <Button
                                    key={tab.value}
                                    variant={
                                        type === tab.value
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => selectType(tab.value)}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {TABS.find((tab) => tab.value === type)?.label ??
                                'All'}{' '}
                            Transactions ({transactions.total})
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <p className="text-muted-foreground">
                                No transactions found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">
                                                Type
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Booking
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Party
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Vehicle
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Amount
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Commission
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Status
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Date
                                            </th>

                                            <th className="pb-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {transactions.data.map(
                                            (transaction) => (
                                                <tr
                                                    key={`${transaction.type}-${transaction.id}`}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-3">
                                                        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">
                                                            {
                                                                TYPE_LABELS[
                                                                    transaction
                                                                        .type
                                                                ]
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="py-3 font-medium">
                                                        #
                                                        {transaction.booking_id}
                                                    </td>

                                                    <td className="py-3 text-muted-foreground">
                                                        {partyLabel(
                                                            transaction,
                                                        )}
                                                    </td>

                                                    <td className="py-3 text-muted-foreground">
                                                        {vehicleLabel(
                                                            transaction,
                                                        )}
                                                    </td>

                                                    <td className="py-3 font-medium">
                                                        ETB {transaction.amount}
                                                    </td>

                                                    <td className="py-3 text-muted-foreground">
                                                        {transaction.commission_amount ? (
                                                            <span className="font-medium text-emerald-600">
                                                                ETB{' '}
                                                                {
                                                                    transaction.commission_amount
                                                                }
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>

                                                    <td className="py-3">
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                STATUS_STYLES[
                                                                    transaction
                                                                        .status
                                                                ] ??
                                                                'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {transaction.status}
                                                        </span>

                                                        {isPendingCashPayment(
                                                            transaction,
                                                        ) && (
                                                            <div className="mt-1">
                                                                <span className="text-xs font-medium text-brand">
                                                                    Awaiting
                                                                    cash
                                                                    confirmation
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="py-3 whitespace-nowrap text-muted-foreground">
                                                        {dateLabel(transaction)}
                                                    </td>

                                                    <td className="py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setSelected(
                                                                        transaction,
                                                                    )
                                                                }
                                                                title="View details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            {isPendingCashPayment(
                                                                transaction,
                                                            ) &&
                                                                can(
                                                                    'payments.manage',
                                                                ) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                                                                        onClick={() =>
                                                                            confirmCashPayment(
                                                                                transaction,
                                                                            )
                                                                        }
                                                                    >
                                                                        <CircleCheck className="mr-1 h-4 w-4" />
                                                                        Confirm
                                                                        Cash
                                                                    </Button>
                                                                )}

                                                            {transaction.type !==
                                                                'payment' &&
                                                                transaction.status ===
                                                                    'pending' &&
                                                                can(
                                                                    'payments.manage',
                                                                ) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handleAction(
                                                                                transaction,
                                                                            )
                                                                        }
                                                                    >
                                                                        {transaction.type ===
                                                                        'refund' ? (
                                                                            <Wallet className="mr-1 h-4 w-4" />
                                                                        ) : (
                                                                            <Banknote className="mr-1 h-4 w-4" />
                                                                        )}

                                                                        {
                                                                            ACTION_LABELS[
                                                                                transaction.type as
                                                                                    | 'refund'
                                                                                    | 'owner_payout'
                                                                                    | 'driver_payout'
                                                                            ]
                                                                        }
                                                                    </Button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {transactions.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {transactions.links.map((link) => (
                                    <Button
                                        key={link.label}
                                        variant={
                                            link.active
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <a
                                            href={link.url ?? '#'}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog
                    open={selected !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelected(null);
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        {selected && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        {TYPE_LABELS[selected.type]} Details
                                    </DialogTitle>

                                    <DialogDescription>
                                        Transaction #{selected.id} for booking #
                                        {selected.booking_id}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-3 text-sm">
                                    <DetailRow
                                        label="Status"
                                        value={
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    STATUS_STYLES[
                                                        selected.status
                                                    ] ??
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {selected.status}
                                            </span>
                                        }
                                    />

                                    {isPendingCashPayment(selected) && (
                                        <div className="rounded-lg border border-brand/30 bg-brand-soft p-3 text-sm text-brand">
                                            <p className="font-semibold">
                                                Cash payment awaiting
                                                confirmation
                                            </p>

                                            <p className="mt-1">
                                                Confirm that the branch has
                                                physically received this cash
                                                payment before marking it as
                                                paid.
                                            </p>
                                        </div>
                                    )}

                                    {selected.type === 'refund' &&
                                        selected.reason && (
                                            <DetailRow
                                                label="Reason"
                                                value={selected.reason}
                                            />
                                        )}

                                    {selected.type === 'payment' && (
                                        <>
                                            {selected.payment_type && (
                                                <DetailRow
                                                    label="Payment Type"
                                                    value={
                                                        PAYMENT_TYPE_LABELS[
                                                            selected
                                                                .payment_type
                                                        ] ??
                                                        selected.payment_type
                                                    }
                                                />
                                            )}

                                            {selected.payment_method && (
                                                <DetailRow
                                                    label="Method"
                                                    value={
                                                        selected.payment_method
                                                    }
                                                />
                                            )}

                                            {isCashPayment(selected) ? (
                                                <DetailRow
                                                    label="Reference"
                                                    value={
                                                        selected.transaction_reference ??
                                                        'Not applicable for cash'
                                                    }
                                                />
                                            ) : selected.transaction_reference ? (
                                                <DetailRow
                                                    label="Reference"
                                                    value={
                                                        selected.transaction_reference
                                                    }
                                                />
                                            ) : null}
                                        </>
                                    )}

                                    <DetailRow
                                        label="Amount"
                                        value={`ETB ${selected.amount}`}
                                    />

                                    {selected.type === 'payment' &&
                                        selected.commission_amount && (
                                            <DetailRow
                                                label="Commission"
                                                value={
                                                    <span className="text-emerald-600">
                                                        ETB{' '}
                                                        {
                                                            selected.commission_amount
                                                        }
                                                    </span>
                                                }
                                            />
                                        )}

                                    {selected.type === 'owner_payout' && (
                                        <>
                                            <DetailRow
                                                label="Gross"
                                                value={`ETB ${selected.gross_amount ?? '0.00'}`}
                                            />

                                            <DetailRow
                                                label="Commission"
                                                value={`ETB ${selected.commission_amount ?? '0.00'}`}
                                            />

                                            <DetailRow
                                                label="Net"
                                                value={`ETB ${selected.net_amount ?? '0.00'}`}
                                            />
                                        </>
                                    )}

                                    {selected.type === 'driver_payout' && (
                                        <DetailRow
                                            label="Driver Earnings"
                                            value={`ETB ${selected.earnings ?? '0.00'}`}
                                        />
                                    )}

                                    {selected.customer && (
                                        <DetailRow
                                            label="Customer"
                                            value={selected.customer}
                                        />
                                    )}

                                    {selected.owner && (
                                        <DetailRow
                                            label="Owner"
                                            value={selected.owner}
                                        />
                                    )}

                                    {selected.driver && (
                                        <DetailRow
                                            label="Driver"
                                            value={selected.driver}
                                        />
                                    )}

                                    {selected.car && (
                                        <DetailRow
                                            label="Vehicle"
                                            value={vehicleLabel(selected)}
                                        />
                                    )}

                                    {selected.booking && (
                                        <>
                                            <DetailRow
                                                label="Pickup"
                                                value={
                                                    selected.booking
                                                        .pickup_location
                                                        ? `${selected.booking.pickup_date ?? '—'} — ${selected.booking.pickup_location}`
                                                        : (selected.booking
                                                              .pickup_date ??
                                                          '—')
                                                }
                                            />

                                            <DetailRow
                                                label="Return"
                                                value={
                                                    selected.booking
                                                        .return_location
                                                        ? `${selected.booking.return_date ?? '—'} — ${selected.booking.return_location}`
                                                        : (selected.booking
                                                              .return_date ??
                                                          '—')
                                                }
                                            />

                                            <DetailRow
                                                label="Booking Total"
                                                value={`ETB ${selected.booking.total_price}${
                                                    selected.booking.need_driver
                                                        ? ' (incl. driver)'
                                                        : ''
                                                }`}
                                            />
                                        </>
                                    )}

                                    <DetailRow
                                        label="Created"
                                        value={selected.created_at}
                                    />

                                    {selected.status_at && (
                                        <DetailRow
                                            label="Resolved"
                                            value={selected.status_at}
                                        />
                                    )}
                                </div>

                                {isPendingCashPayment(selected) &&
                                    can('payments.manage') && (
                                        <div className="mt-4 border-t pt-4">
                                            <Button
                                                className="w-full"
                                                onClick={() =>
                                                    confirmCashPayment(selected)
                                                }
                                            >
                                                <CircleCheck className="mr-2 h-4 w-4" />
                                                Confirm Cash Payment
                                            </Button>
                                        </div>
                                    )}
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>

            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

AdminTransactions.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Transactions',
            href: '/admin/transactions',
        },
    ],
};
