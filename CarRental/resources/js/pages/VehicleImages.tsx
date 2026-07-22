import { Head } from '@inertiajs/react';

interface Image {
    id: number;
    car_id: number;
    image_path: string;
    is_primary: boolean;
}

interface Props {
    images: Image[];
}

export default function VehicleImages({ images = [] }: Props) {
    return (
        <>
            <Head title="Vehicle Images" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Vehicle Images
                </h1>

                <div className="mt-6 rounded-lg border p-6">
                    {images.length === 0 ? (
                        <p>No vehicle images available.</p>
                    ) : (
                        images.map((image) => (
                            <div key={image.id} className="border-b py-3">
                                <p>Car ID: {image.car_id}</p>
                                <p>Image: {image.image_path}</p>
                                <p>
                                    Primary: {image.is_primary ? 'Yes' : 'No'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}