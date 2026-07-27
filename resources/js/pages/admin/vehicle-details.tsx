import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface VehicleDocument {
    id: number;
    document_type: string;
    document_path: string;
    expiry_date: string | null;
    verification_status: string;
}

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    category: string;
    color: string;
    fuel_type: string;
    transmission: string;
    engine_size: string | null;
    mileage: number | null;
    seats: number | null;
    daily_price: string;
    description: string | null;
    approval_status: string;
    availability_status: string;
    owner: { name: string; email: string };
    images: { id: number; image_path: string; is_primary: boolean }[];
    documents: VehicleDocument[];
}

interface Props { vehicle: Vehicle; }

const APPROVAL_STYLES: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending:  'bg-yellow-100 text-yellow-800',
};

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value ?? '—'}</p>
        </div>
    );
}

export default function VehicleDetails({ vehicle }: Props) {
    function handleApprove() {
        router.post(`/admin/vehicles/${vehicle.id}/approve`);
    }

    function handleReject() {
        if (confirm('Reject this vehicle?')) router.post(`/admin/vehicles/${vehicle.id}/reject`);
    }

    function handleApproveDoc(docId: number) {
        router.post(`/admin/vehicles/${vehicle.id}/documents/approve`, { document_id: docId });
    }

    function handleRejectDoc(docId: number) {
        if (confirm('Reject this document?')) router.post(`/admin/vehicles/${vehicle.id}/documents/reject`, { document_id: docId });
    }

    return (
        <>
            <Head title={`${vehicle.brand} ${vehicle.model}`} />

            <div className="p-6 space-y-6 max-w-4xl">
                <Link href="/admin/vehicles" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Vehicles
                </Link>

                {/* Vehicle Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${APPROVAL_STYLES[vehicle.approval_status] ?? 'bg-gray-100 text-gray-800'}`}>
                                {vehicle.approval_status}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${vehicle.availability_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {vehicle.availability_status}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {vehicle.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {vehicle.images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={`/storage/${img.image_path}`}
                                        alt="Vehicle"
                                        className="h-32 w-full rounded-md object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                            <DetailRow label="Owner" value={vehicle.owner.name} />
                            <DetailRow label="Owner Email" value={vehicle.owner.email} />
                            <DetailRow label="Plate Number" value={vehicle.plate_number} />
                            <DetailRow label="Category" value={vehicle.category} />
                            <DetailRow label="Color" value={vehicle.color} />
                            <DetailRow label="Fuel Type" value={vehicle.fuel_type} />
                            <DetailRow label="Transmission" value={vehicle.transmission} />
                            <DetailRow label="Engine Size" value={vehicle.engine_size} />
                            <DetailRow label="Mileage" value={vehicle.mileage ? `${vehicle.mileage} km` : null} />
                            <DetailRow label="Seats" value={vehicle.seats} />
                            <DetailRow label="Daily Price" value={`ETB ${vehicle.daily_price}`} />
                        </div>

                        {vehicle.description && (
                            <div>
                                <p className="text-xs text-muted-foreground">Description</p>
                                <p className="text-sm">{vehicle.description}</p>
                            </div>
                        )}

                        {vehicle.approval_status === 'pending' && (
                            <div className="flex gap-3 border-t pt-4">
                                <Button onClick={handleApprove}>
                                    <CheckCircle className="mr-1.5 h-4 w-4" /> Approve Vehicle
                                </Button>
                                <Button variant="destructive" onClick={handleReject}>
                                    <XCircle className="mr-1.5 h-4 w-4" /> Reject Vehicle
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Vehicle Documents
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {vehicle.documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                        ) : (
                            <div className="space-y-3">
                                {vehicle.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium capitalize">
                                                {doc.document_type.replace(/_/g, ' ')}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {doc.expiry_date && (
                                                    <span>Expires: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                                                )}
                                                <a
                                                    href={`/storage/${doc.document_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    View file ↗
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${APPROVAL_STYLES[doc.verification_status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                {doc.verification_status}
                                            </span>
                                            {doc.verification_status === 'pending' && (
                                                <>
                                                    <Button size="sm" onClick={() => handleApproveDoc(doc.id)}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleRejectDoc(doc.id)}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
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

VehicleDetails.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Vehicles', href: '/admin/vehicles' },
        { title: 'Details', href: '#' },
    ],
};
