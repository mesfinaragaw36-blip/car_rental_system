import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Branch {
    id: number;
    name: string;
    location: string;
    phone: string | null;
    email: string | null;
    status: boolean;
}

interface Props {
    branches: Branch[];
    totalBranches: number;
    activeBranches: number;
    inactiveBranches: number;
}

export default function Branches({
    branches,
    totalBranches,
    activeBranches,
    inactiveBranches,
}: Props) {

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        location: '',
        phone: '',
        email: '',
        status: true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/branches', {
            onSuccess: () => reset(),
        });
    }


    return (
        <div className="p-6 space-y-6">

            <h1 className="text-3xl font-bold">
                Branch Management
            </h1>
return (
    <div className="p-6 space-y-6">

        {/* Page Header */}
        <div>
            <h1 className="text-3xl font-bold">
                Branch Management
            </h1>

            <p className="text-muted-foreground">
                Manage company branches.
            </p>
        </div>

        {/* ⭐ ADD THE STATISTICS CARDS HERE */}
        <div className="grid gap-4 md:grid-cols-3">

            <Card>
                <CardHeader>
                    <CardTitle>Total Branches</CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-3xl font-bold">
                        {totalBranches}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Branches</CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-3xl font-bold">
                        {activeBranches}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Inactive Branches</CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-3xl font-bold">
                        {inactiveBranches}
                    </p>
                </CardContent>
            </Card>

        </div>

        {/* Add Branch Form */}
        <Card>
            ...
        </Card>

        {/* Branches Table */}
        <Card>
            ...
        </Card>

    </div>
);

            <Card>

                <CardHeader>
                    <CardTitle>
                        Add Branch
                    </CardTitle>
                </CardHeader>


                <CardContent>

                    <form onSubmit={submit} className="space-y-4">

                        <Input
                            placeholder="Branch Name"
                            value={data.name}
                            onChange={(e)=>
                                setData('name', e.target.value)
                            }
                        />


                        <Input
                            placeholder="Location"
                            value={data.location}
                            onChange={(e)=>
                                setData('location', e.target.value)
                            }
                        />


                        <Input
                            placeholder="Phone"
                            value={data.phone}
                            onChange={(e)=>
                                setData('phone', e.target.value)
                            }
                        />


                        <Input
                            placeholder="Email"
                            value={data.email}
                            onChange={(e)=>
                                setData('email', e.target.value)
                            }
                        />


                        <Button disabled={processing}>
                            Save Branch
                        </Button>

                    </form>

                </CardContent>

            </Card>


            <Card>

                <CardHeader>
                    <CardTitle>
                        Branch List
                    </CardTitle>
                </CardHeader>


                <CardContent>
<Table>

    <TableHeader>

        <TableRow>

            <TableHead>Name</TableHead>

            <TableHead>Location</TableHead>

            <TableHead>Phone</TableHead>

            <TableHead>Email</TableHead>

            <TableHead>Status</TableHead>

            <TableHead>Action</TableHead>

        </TableRow>

    </TableHeader>

    <TableBody>

        {branches.map((branch) => (

            <TableRow key={branch.id}>

                <TableCell>{branch.name}</TableCell>

                <TableCell>{branch.location}</TableCell>

                <TableCell>{branch.phone}</TableCell>

                <TableCell>{branch.email}</TableCell>

                <TableCell>
                    {branch.status ? 'Active' : 'Inactive'}
                </TableCell>

                <TableCell>
                    Edit | Delete
                </TableCell>

            </TableRow>

        ))}

    </TableBody>

</Table>

                </CardContent>

            </Card>

        </div>
    );
}