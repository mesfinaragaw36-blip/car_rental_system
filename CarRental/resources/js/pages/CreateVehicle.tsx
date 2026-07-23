import { Head, useForm } from '@inertiajs/react';

export default function CreateVehicle() {
    const { data, setData, post, processing } = useForm({
        brand: '',
        model: '',
        year: '',
        plate_number: '',
        category: '',
        color: '',
        fuel_type: '',
        transmission: '',
        daily_price: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/owner/vehicles');
    }

    return (
        <>
            <Head title="Add Vehicle" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Add Vehicle
                </h1>

                <form
                    onSubmit={submit}
                    className="mt-6 space-y-4 rounded-lg border p-6"
                >
                    <input
                        className="w-full rounded border p-2"
                        placeholder="Brand"
                        value={data.brand}
                        onChange={e => setData('brand', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Model"
                        value={data.model}
                        onChange={e => setData('model', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Year"
                        value={data.year}
                        onChange={e => setData('year', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Plate Number"
                        value={data.plate_number}
                        onChange={e => setData('plate_number', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Category"
                        value={data.category}
                        onChange={e => setData('category', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Color"
                        value={data.color}
                        onChange={e => setData('color', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Fuel Type"
                        value={data.fuel_type}
                        onChange={e => setData('fuel_type', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Transmission"
                        value={data.transmission}
                        onChange={e => setData('transmission', e.target.value)}
                    />

                    <input
                        className="w-full rounded border p-2"
                        placeholder="Daily Price"
                        value={data.daily_price}
                        onChange={e => setData('daily_price', e.target.value)}
                    />

                    <button
                        disabled={processing}
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        Save Vehicle
                    </button>
                </form>
            </div>
        </>
    );
}