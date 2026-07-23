import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Customer {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
    license_number: string;
    license_expiry: string;
    address: string | null;
    status: string;
}

interface Props {
    customers: Customer[];
}

export default function Customers({ customers }: Props) {

    const { data, setData, post, processing, reset } = useForm({
        full_name: '',
        phone: '',
        email: '',
        license_number: '',
        license_expiry: '',
        address: '',
        status: 'Active',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/customers', {
            onSuccess: () => reset(),
        });
    }

    return (
        <div className="p-6 space-y-6">

            <div>
                <h1 className="text-3xl font-bold">
                    Customer Registration
                </h1>

                <p className="text-muted-foreground">
                    Register customers before renting a vehicle.
                </p>
            </div>

            <Card>

                <CardHeader>
                    <CardTitle>
                        Register Customer
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    <form
                        onSubmit={submit}
                        className="space-y-4"
                    >

                        <Input
                            placeholder="Full Name"
                            value={data.full_name}
                            onChange={(e) =>
                                setData('full_name', e.target.value)
                            }
                        />

                        <Input
                            placeholder="Phone Number"
                            value={data.phone}
                            onChange={(e) =>
                                setData('phone', e.target.value)
                            }
                        />

                        <Input
                            type="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={(e) =>
                                setData('email', e.target.value)
                            }
                        />

                        <Input
                            placeholder="Driver License Number"
                            value={data.license_number}
                            onChange={(e) =>
                                setData('license_number', e.target.value)
                            }
                        />

                        <Input
                            type="date"
                            value={data.license_expiry}
                            onChange={(e) =>
                                setData('license_expiry', e.target.value)
                            }
                        />

                        <Input
                            placeholder="Address"
                            value={data.address}
                            onChange={(e) =>
                                setData('address', e.target.value)
                            }
                        />

                        <Button disabled={processing}>
                            Save Customer
                        </Button>

                    </form>

                </CardContent>

            </Card>

            <Card>

                <CardHeader>
                    <CardTitle>
                        Customer List
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    {customers.length === 0 ? (

                        <p>No customers registered.</p>

                    ) : (

                        <Table>

                            <TableHeader>

                                <TableRow>

                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>License</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>

                                </TableRow>

                            </TableHeader>

                            <TableBody>

                                {customers.map((customer) => (

                                    <TableRow key={customer.id}>

                                        <TableCell>
                                            {customer.full_name}
                                        </TableCell>

                                        <TableCell>
                                            {customer.phone}
                                        </TableCell>

                                        <TableCell>
                                            {customer.license_number}
                                        </TableCell>

                                        <TableCell>
                                            {customer.status}
                                        </TableCell>
                                        <TableCell>
                                        <Button
                                     variant="destructive"
                                     onClick={() => {
                                    if (confirm('Delete this customer?')) {
                                  router.delete(`/customers/${customer.id}`);
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