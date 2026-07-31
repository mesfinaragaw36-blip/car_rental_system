import { Head, Link, router, usePage } from '@inertiajs/react';
import { MapPin, CalendarDays, CarFront, Eye, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AvailableBooking {
    id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    daily_price: string;
    driver_daily_rate: string;
    total_price: string;
    notes: string | null;
    booking_status: string;
    car: { id: number; brand: string; model: string; year: number; plate_number: string; photo: string | null };
    owner: { id: number; name: string; phone: string };
    customer: { id: number; name: string; phone: string };
}

interface Props {
    bookings: AvailableBooking[];
    filters: { location?: string; date?: string };
    profileStatus: string;
    hasProfile: boolean;
}

export default function AvailableBookings({ bookings = [], filters, profileStatus, hasProfile }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;
    const [location, setLocation] = useState(filters.location ?? '');
    const [date, setDate] = useState(filters.date ?? '');
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    function applyFilters() {
        router.get('/driver/available-bookings', { location, date: date || undefined }, { preserveState: true, replace: true });
    }

    function handleClaim(bookingId: number) {
        setClaimingId(bookingId);
        router.post(`/driver/claim/${bookingId}`, {}, {
            preserveScroll: true,
            onFinish: () => setClaimingId(null),
        });
    }

    const needsProfile = !hasProfile;
    const needsVerification = profileStatus && profileStatus !== 'approved';
    const isBlocked = needsProfile || needsVerification;

    function calcEarnings(b: AvailableBooking): string {
        const pickup = new Date(b.pickup_date);
        const ret = new Date(b.return_date);
        const days = Math.max(1, Math.ceil((ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));

        return (Number(b.driver_daily_rate) * days).toFixed(2);
    }

    return (
        <>
            <Head title="Available Trips" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Available Trips</h1>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{toast.message}</div>
                )}

                {isBlocked && (
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <ShieldAlert className="h-8 w-8 text-amber-600 shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-lg font-semibold text-amber-800">
                                        {needsProfile ? 'Complete Your Driver Profile' : 'Account Verification Required'}
                                    </h2>
                                    <p className="text-amber-700 mt-1">
                                        {needsProfile
                                            ? 'You need to set up your driver profile before you can browse and claim available trips.'
                                            : 'Your driver account is currently pending. An admin needs to verify your information before you can claim trips.'}
                                    </p>
                                    <Link
                                        href="/settings/profile"
                                        className="inline-flex items-center mt-3 text-sm font-medium text-amber-800 underline hover:text-amber-900"
                                    >
                                        Go to Settings &rarr; Complete Your Profile
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-2 flex-wrap">
                    <div className="space-y-1">
                        <Label className="text-xs">Location</Label>
                        <Input placeholder="Filter by city..." value={location} onChange={(e) => setLocation(e.target.value)} className="w-48" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
                    </div>
                    <Button variant="secondary" className="self-end" onClick={applyFilters}>Filter</Button>
                </div>

                {!isBlocked && bookings.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CarFront className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No trips available right now. Check back later or adjust your filters.</p>
                    </div>
                )}

                {!isBlocked && bookings.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((b) => (
                            <Card key={b.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                <div className="relative h-36">
                                    {b.car.photo ? (
                                        <img src={`/storage/${b.car.photo}`} alt={`${b.car.brand} ${b.car.model}`} className="w-full h-36 object-cover" />
                                    ) : (
                                        <div className="w-full h-36 bg-muted flex items-center justify-center">
                                            <CarFront className="h-10 w-10 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <Link
                                        href={`/cars/${b.car.id}`}
                                        className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Link>
                                </div>

                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">{b.car.brand} {b.car.model}</h3>
                                        <span className="text-xs text-muted-foreground">{b.car.year}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                        <span>{b.pickup_date} &rarr; {b.return_date}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{b.pickup_location}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Your earnings</p>
                                            <p className="text-lg font-bold text-green-600">ETB {calcEarnings(b)}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                                            >
                                                {expandedId === b.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                            <Button size="sm" className="h-8" disabled={claimingId === b.id} onClick={() => handleClaim(b.id)}>
                                                {claimingId === b.id ? '...' : 'Claim'}
                                            </Button>
                                        </div>
                                    </div>

                                    {expandedId === b.id && (
                                        <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                                            <p><span className="font-medium text-foreground">Car: </span>{b.car.brand} {b.car.model} ({b.car.year}) &middot; {b.car.plate_number}</p>
                                            <p><span className="font-medium text-foreground">Owner: </span>{b.owner.name} &middot; {b.owner.phone}</p>
                                            <p><span className="font-medium text-foreground">Customer: </span>{b.customer.name} &middot; {b.customer.phone}</p>
                                            <p><span className="font-medium text-foreground">Return: </span>{b.return_date} &middot; {b.return_location}</p>
                                            <p className="text-xs">Daily rate: ETB {b.driver_daily_rate} &times; {Math.max(1, Math.ceil((new Date(b.return_date).getTime() - new Date(b.pickup_date).getTime()) / (1000 * 60 * 60 * 24)))} days</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AvailableBookings.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Available Trips', href: '' }],
};