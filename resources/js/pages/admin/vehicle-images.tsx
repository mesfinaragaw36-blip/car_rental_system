import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Image {
    id: number;
    car_id: number;
    image_path: string;
    is_primary: boolean;
    car: {
        brand: string;
        model: string;
    };
}

interface Props {
    images: Image[];
}

export default function VehicleImages({ images = [] }: Props) {
    return (
        <>
            <Head title="Vehicle Images" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Vehicle Images</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>All Images</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {images.length === 0 ? (
                            <p className="text-muted-foreground">
                                No vehicle images available.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {image.car.brand}{' '}
                                                {image.car.model}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {image.image_path}
                                            </p>
                                        </div>

                                        <span className="text-sm">
                                            {image.is_primary
                                                ? 'Primary'
                                                : 'Secondary'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
