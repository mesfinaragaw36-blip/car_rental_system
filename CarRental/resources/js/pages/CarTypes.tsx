import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface CarType {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
}

interface Props {
    carTypes: CarType[];
}

export default function CarTypes({ carTypes }: Props) {

    // Car Type Form
    const { 
        data, 
        setData, 
        post, 
        processing, 
        reset 
    } = useForm({
        name: '',
        description: '',
        status: true,
    });
const [editingId, setEditingId] = useState<number | null>(null);

    // Brand Form
    const brandForm = useForm({
        name: '',
        country: '',
        status: true,
    });


    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/cartype', {
            onSuccess: () => reset(),
        });
    }


    function submitBrand(e: React.FormEvent) {
        e.preventDefault();

        brandForm.post('/brands', {
            onSuccess: () => brandForm.reset(),
        });
    }


    return (
        <div className="p-6 space-y-6">

            <div>
                <h1 className="text-3xl font-bold">
                    Car Types Management
                </h1>

                <p className="text-muted-foreground">
                    Manage vehicle types, brands, models, and codes.
                </p>
            </div>


            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">

                <Card>
                    <CardHeader>
                        <CardTitle>Total Types</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-bold">
                            {carTypes.length}
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Total Brands</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-bold">
                            0
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Total Models</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-bold">
                            0
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Total Codes</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-3xl font-bold">
                            0
                        </p>
                    </CardContent>
                </Card>

            </div>



            {/* Add Car Type */}
            <Card>

                <CardHeader>
                    <CardTitle>
                        Add Car Type
                    </CardTitle>
                </CardHeader>


                <CardContent>

                    <form
                        onSubmit={submit}
                        className="space-y-4"
                    >

                        <Input
                            placeholder="Car Type Name"
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                        />


                        <Textarea
                            placeholder="Description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />


                        <Button disabled={processing}>
                            Save Car Type
                        </Button>

                    </form>

                </CardContent>

            </Card>




            {/* Add Brand */}
            <Card>

                <CardHeader>
                    <CardTitle>
                        Add Brand
                    </CardTitle>
                </CardHeader>


                <CardContent>

                    <form
                        onSubmit={submitBrand}
                        className="space-y-4"
                    >

                        <Input
                            placeholder="Brand Name"
                            value={brandForm.data.name}
                            onChange={(e) =>
                                brandForm.setData(
                                    'name',
                                    e.target.value
                                )
                            }
                        />


                        <Input
                            placeholder="Country"
                            value={brandForm.data.country}
                            onChange={(e) =>
                                brandForm.setData(
                                    'country',
                                    e.target.value
                                )
                            }
                        />


                        <Button disabled={brandForm.processing}>
                            Save Brand
                        </Button>

                    </form>

                </CardContent>

            </Card>




            {/* Car Types List */}
            <Card>

                <CardHeader>
                    <CardTitle>
                        Car Types List
                    </CardTitle>
                </CardHeader>


                <CardContent>

                    {carTypes.length === 0 ? (

                        <p>
                            No car types available.
                        </p>

                    ) : (

                        <Table>

                            <TableHeader>

                                <TableRow>

                                    <TableHead>
                                        Name
                                    </TableHead>

                                    <TableHead>
                                        Description
                                    </TableHead>

                                    <TableHead>
                                        Status
                                    </TableHead>

                                    <TableHead>
                                        Action
                                    </TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {carTypes.map((type) => (

                                    <TableRow key={type.id}>

                                        <TableCell>
                                            {type.name}
                                        </TableCell>


                                        <TableCell>
                                            {type.description}
                                        </TableCell>


                                        <TableCell>
                                            {type.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </TableCell>


                                        <TableCell className="space-x-2">

                                         <Button
                                             variant="outline"
                                                size="sm"
                                            onClick={() => {
                                           setEditingId(type.id);

                                             setData({
                                          name: type.name,
                                      description: type.description ?? '',
                                      status: type.status,
                                                   });
                                                }}
>
                                             Edit
                                        </Button>

                                     <Button
                            variant="destructive"
                                size="sm"
                                onClick={() => {
                         if (confirm('Delete this car type?')) {
                          router.delete(`/cartype/${type.id}`);
                                     }
                                        }}
    >
                                     Delete
                                </Button>

                            </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    )}

                </CardContent>

            </Card>


        </div>
    );
}