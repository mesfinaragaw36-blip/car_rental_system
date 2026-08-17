import { Head, Link, useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { StarRating } from '@/components/rating-stars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { login, register } from '@/routes';
import { book } from '@/routes/cars';
import { edit as editProfile } from '@/routes/profile';

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    daily_rate: string;
    fuel_type: string;
    transmission: string;
    category: string;
    color: string;
    engine_size?: string;
    mileage?: number;
    seats?: number;
    description?: string;
    availability_status: string;
    is_currently_booked: boolean;
    photo: string | null;
    owner: { id: number; name: string; phone: string; email: string };
    images?: { id: number; image_path: string; is_primary: boolean }[];
    average_rating?: number;
    review_count?: number;
    recent_reviews?: {
        id: number;
        reviewer: { id: number; name: string };
        rating: number;
        review_text?: string | null;
        created_at: string;
    }[];
    available_periods?: { id: number; start_date: string; end_date: string }[];
}

interface Location {
    id: number;
    name: string;
    city: string;
}

interface Props {
    car: Car;
    role: string | null;
    verification_status?: string | null;
    locations: Location[];
}

export default function CarDetails({
    car,
    role,
    verification_status = null,
    locations,
}: Props) {
    const { props: p } = usePage<{
        toast?: { type: string; message: string };
    }>();
    const toast = p.toast;

    const { data, setData, post, processing, errors } = useForm({
        pickup_date: '',
        return_date: '',
        pickup_branch_id: '',
        return_branch_id: '',
        need_driver: false,
        notes: '',
    });

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        post(book.url({ car: car.id }), {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                {toast && (
                    <div
                        className={`rounded-lg p-4 ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        {car.images && car.images.length > 0 ? (
                            <img
                                src={`/storage/${car.images.find((i) => i.is_primary)?.image_path ?? car.images[0].image_path}`}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full rounded-lg object-cover"
                            />
                        ) : car.photo ? (
                            <img
                                src={`/storage/${car.photo}`}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full rounded-lg object-cover"
                            />
                        ) : (
                            <div className="flex h-64 w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                No image
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl font-bold">
                                    {car.brand} {car.model} ({car.year})
                                </h1>
                                {car.average_rating !== undefined && (
                                    <div className="mt-1 flex items-center gap-2">
                                        <StarRating
                                            value={car.average_rating}
                                            size="sm"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {car.average_rating} ·{' '}
                                            {car.review_count ?? 0} review
                                            {(car.review_count ?? 0) === 1
                                                ? ''
                                                : 's'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-primary">
                                ETB {car.daily_rate}/day
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Fuel:</span>
                            <span>{car.fuel_type}</span>
                            <span className="text-muted-foreground">
                                Transmission:
                            </span>
                            <span>{car.transmission}</span>
                            <span className="text-muted-foreground">
                                Category:
                            </span>
                            <span>{car.category}</span>
                            <span className="text-muted-foreground">
                                Color:
                            </span>
                            <span>{car.color}</span>
                            {car.engine_size && (
                                <>
                                    <span className="text-muted-foreground">
                                        Engine:
                                    </span>
                                    <span>{car.engine_size}</span>
                                </>
                            )}
                            {car.seats && (
                                <>
                                    <span className="text-muted-foreground">
                                        Seats:
                                    </span>
                                    <span>{car.seats}</span>
                                </>
                            )}
                            {car.mileage && (
                                <>
                                    <span className="text-muted-foreground">
                                        Mileage:
                                    </span>
                                    <span>{car.mileage} km</span>
                                </>
                            )}
                        </div>
                        {car.description && (
                            <p className="text-sm text-muted-foreground">
                                {car.description}
                            </p>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {car.recent_reviews && car.recent_reviews.length > 0 ? (
                            <div className="space-y-4">
                                {car.recent_reviews.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-shadow hover:shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                                    {r.reviewer.name
                                                        .split(' ')
                                                        .map((part) =>
                                                            part[0],
                                                        )
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {r.reviewer.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            r.created_at,
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <StarRating
                                                value={r.rating}
                                                size="sm"
                                            />
                                        </div>
                                        {r.review_text && (
                                            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                                                {r.review_text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No reviews yet for this vehicle. Be the first to
                                leave one.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {car.available_periods && car.available_periods.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Dates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                {car.available_periods.map((period) => (
                                    <li
                                        key={period.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                                    >
                                        <span className="font-medium">
                                            {period.start_date} →{' '}
                                            {period.end_date}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 text-xs text-muted-foreground">
                                This vehicle can be booked during these dates.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {car.is_currently_booked && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-800">
                                Currently Booked
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-700">
                                This vehicle is currently booked and not
                                available for new reservations at this time.
                                Please check back later or browse other
                                available vehicles.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!role && !car.is_currently_booked && (
                    <Card className="border-primary/30 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Ready to Book?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Create an account or sign in to book this
                                vehicle.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Link
                                        href={login.url({
                                            query: {
                                                redirect: `/cars/${car.id}`,
                                            },
                                        })}
                                    >
                                        Log in
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                >
                                    <Link
                                        href={register.url({
                                            query: {
                                                redirect: `/cars/${car.id}`,
                                            },
                                        })}
                                    >
                                        Sign up
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {role === 'customer' &&
                    car.availability_status === 'available' &&
                    !car.is_currently_booked &&
                    (verification_status !== 'approved' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Required</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    You need to be approved before booking a
                                    car. Please submit your national ID on your
                                    profile page to complete verification.
                                </p>
                                <Button asChild>
                                    <Link href={editProfile.url()}>
                                        Go to Profile
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Book This Car</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleBook}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="pickup_date">
                                                Pickup Date
                                            </Label>
                                            <Input
                                                id="pickup_date"
                                                type="date"
                                                value={data.pickup_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'pickup_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.pickup_date}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="return_date">
                                                Return Date
                                            </Label>
                                            <Input
                                                id="return_date"
                                                type="date"
                                                value={data.return_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'return_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.return_date}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="pickup_branch_id">
                                                Pickup Location
                                            </Label>
                                            <Select
                                                value={data.pickup_branch_id}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'pickup_branch_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a pickup branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map(
                                                        (location) => (
                                                            <SelectItem
                                                                key={
                                                                    location.id
                                                                }
                                                                value={String(
                                                                    location.id,
                                                                )}
                                                            >
                                                                {location.name},{' '}
                                                                {location.city}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.pickup_branch_id
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="return_branch_id">
                                                Return Location
                                            </Label>
                                            <Select
                                                value={data.return_branch_id}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'return_branch_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a return branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map(
                                                        (location) => (
                                                            <SelectItem
                                                                key={
                                                                    location.id
                                                                }
                                                                value={String(
                                                                    location.id,
                                                                )}
                                                            >
                                                                {location.name},{' '}
                                                                {location.city}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.return_branch_id
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="need_driver"
                                            checked={data.need_driver}
                                            onChange={(e) =>
                                                setData(
                                                    'need_driver',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <Label htmlFor="need_driver">
                                            I need a driver
                                        </Label>
                                    </div>
                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Booking...' : 'Book Now'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </>
    );
}

CarDetails.layout = {
    breadcrumbs: [
        { title: 'Browse Cars', href: '/browse-cars' },
        { title: 'Car Details', href: '' },
    ],
};
