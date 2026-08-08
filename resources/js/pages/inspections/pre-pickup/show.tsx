import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Booking {
    id: number;
    status: string;
    car: {
        brand: string;
        model: string;
        plate_number: string;
    };
}

interface Props {
    booking: Booking;
    inspection: any;
}

export default function Show({ booking }: Props) {

    const { data, setData, post, processing } = useForm({
        outside_ok: false,
        inside_ok: false,
        mileage_ok: false,
        fuel_ok: false,

        outside_ok_photo: null as File | null,
        inside_ok_photo: null as File | null,
        mileage_ok_photo: null as File | null,
        fuel_ok_photo: null as File | null,

        comments: '',
    });


    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/inspections/pre-pickup/${booking.id}`, {
            forceFormData: true,
        });
    };


    return (
        <>
            <Head title="Pre Pickup Inspection" />

            <div className="p-6">

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Pre-Pickup Inspection
                        </CardTitle>

                        <p>
                            {booking.car.brand} {booking.car.model}
                            <br />
                            Plate: {booking.car.plate_number}
                        </p>

                    </CardHeader>


                    <CardContent>

                        <form onSubmit={submit} className="space-y-6">


                            {[
                                {
                                    key:'outside_ok',
                                    photo:'outside_ok_photo',
                                    label:'Outside condition'
                                },
                                {
                                    key:'inside_ok',
                                    photo:'inside_ok_photo',
                                    label:'Inside condition'
                                },
                                {
                                    key:'mileage_ok',
                                    photo:'mileage_ok_photo',
                                    label:'Mileage'
                                },
                                {
                                    key:'fuel_ok',
                                    photo:'fuel_ok_photo',
                                    label:'Fuel level'
                                },

                            ].map((item:any)=>(

                                <div key={item.key}
                                    className="border rounded-lg p-4 space-y-3">

                                    <label className="font-semibold">
                                        {item.label}
                                    </label>


                                     <div>
                                         <label>
                                             <input
                                                 type="checkbox"
                                                 checked={(data as Record<string, any>)[item.key]}
                                                 onChange={(e)=>
                                                     setData(
                                                         item.key as any,
                                                         e.target.checked
                                                     )
                                                 }
                                             />

                                             {' '}Passed
                                         </label>
                                     </div>


                                     <input
                                         type="file"
                                         onChange={(e)=>
                                             setData(
                                                 item.photo as any,
                                                 e.target.files?.[0] ?? null
                                             )
                                         }
                                     />

                                </div>

                            ))}



                            <textarea
                                className="border rounded-lg w-full p-3"
                                placeholder="Comments"
                                value={data.comments}
                                onChange={(e)=>
                                    setData(
                                        'comments',
                                        e.target.value
                                    )
                                }
                            />



                            <Button disabled={processing}>
                                Submit Inspection
                            </Button>


                        </form>

                    </CardContent>

                </Card>

            </div>
        </>
    );
}