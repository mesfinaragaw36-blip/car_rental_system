import { useState, useEffect } from 'react';
import { User, Star, FileCheck, Shield, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DriverProfile {
    gender: string | null;
    experience_years: number;
    daily_rate: number;
    license_number: string;
    license_type: string | null;
    location: string | null;
    has_license_document: boolean;
    has_national_id_document: boolean;
}

interface Driver {
    id: number;
    name: string;
    phone: string;
    profile: DriverProfile;
}

interface DriverSelectionProps {
    pickupDate: string;
    returnDate: string;
    selectedDriverId: number | null;
    onDriverSelect: (driverId: number | null) => void;
}

export default function DriverSelection({
    pickupDate,
    returnDate,
    selectedDriverId,
    onDriverSelect,
}: DriverSelectionProps) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (pickupDate && returnDate) {
            fetchDrivers();
        }
    }, [pickupDate, returnDate]);

    const fetchDrivers = async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                pickup_date: pickupDate,
                return_date: returnDate,
            });

            const response = await fetch(`/api/available-drivers?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load drivers');
            }

            const data = await response.json();
            setDrivers(data.drivers || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load available drivers');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-6">
                    <div className="text-center text-muted-foreground">
                        Loading available drivers...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="py-6">
                    <div className="text-center text-red-600">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (drivers.length === 0) {
        return (
            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-6">
                    <div className="text-center text-amber-800">
                        <p className="font-medium">No drivers available</p>
                        <p className="mt-1 text-sm">
                            No drivers are available for your selected dates. A
                            driver will be automatically assigned after you pay
                            the deposit and the vehicle inspection is approved.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choose Your Driver</h3>
                {selectedDriverId && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDriverSelect(null)}
                    >
                        Clear Selection
                    </Button>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {drivers.map((driver) => (
                    <Card
                        key={driver.id}
                        className={`cursor-pointer transition-all ${
                            selectedDriverId === driver.id
                                ? 'border-primary bg-accent shadow-md'
                                : 'hover:border-primary/50 hover:bg-accent/50'
                        }`}
                        onClick={() => onDriverSelect(driver.id)}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-base">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <span>{driver.name}</span>
                                </div>
                                {selectedDriverId === driver.id && (
                                    <Badge className="bg-green-500">
                                        Selected
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3 text-sm">
                            {/* Gender */}
                            {driver.profile.gender && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="capitalize text-muted-foreground">
                                        {driver.profile.gender}
                                    </span>
                                </div>
                            )}

                            {/* Experience */}
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span>
                                    {driver.profile.experience_years}{' '}
                                    {driver.profile.experience_years === 1
                                        ? 'year'
                                        : 'years'}{' '}
                                    experience
                                </span>
                            </div>

                            {/* License Type */}
                            {driver.profile.license_type && (
                                <div className="flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-blue-500" />
                                    <span>
                                        License: {driver.profile.license_type}
                                    </span>
                                </div>
                            )}

                            {/* Location */}
                            {driver.profile.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-green-500" />
                                    <span className="text-muted-foreground">
                                        {driver.profile.location}
                                    </span>
                                </div>
                            )}

                            {/* Daily Rate */}
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                    ETB {driver.profile.daily_rate.toFixed(2)}{' '}
                                    /day
                                </span>
                            </div>

                            {/* Documents */}
                            <div className="flex flex-wrap gap-2 border-t pt-2">
                                {driver.profile.has_license_document && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        <Shield className="mr-1 h-3 w-3" />
                                        License Verified
                                    </Badge>
                                )}
                                {driver.profile.has_national_id_document && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        <Shield className="mr-1 h-3 w-3" />
                                        ID Verified
                                    </Badge>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="text-xs text-muted-foreground">
                                Contact: {driver.phone}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!selectedDriverId && (
                <p className="text-sm text-muted-foreground">
                    Optional: Select a driver or leave blank for automatic
                    assignment after deposit payment and vehicle inspection.
                </p>
            )}
        </div>
    );
}
