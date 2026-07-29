import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Document {
    id: number;
    car_id: number;
    document_type: string;
    document_path: string;
    expiry_date?: string;
    verification_status: string;
    car: {
        brand: string;
        model: string;
    };
}

interface Props {
    documents: Document[];
}

export default function VehicleDocuments({ documents = [] }: Props) {
    const form = useForm({ document_id: '' });

    function approveDocument(carId: number, documentId: number) {
        form.setData('document_id', String(documentId));
        form.post(`/admin/vehicles/${carId}/documents/approve`, {
            preserveScroll: true,
        });
    }

    function rejectDocument(carId: number, documentId: number) {
        form.setData('document_id', String(documentId));
        form.post(`/admin/vehicles/${carId}/documents/reject`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Vehicle Documents" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Vehicle Documents</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>All Documents</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {documents.length === 0 ? (
                            <p className="text-muted-foreground">
                                No vehicle documents available.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((document) => (
                                    <div
                                        key={document.id}
                                        className="grid gap-4 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {document.car.brand}{' '}
                                                {document.car.model}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {document.document_type} document
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Expires:{' '}
                                                {document.expiry_date ?? 'No expiry'}
                                            </p>

                                            <a
                                                href={`/storage/${document.document_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 inline-flex text-sm font-medium text-primary"
                                            >
                                                View document
                                            </a>
                                        </div>

                                        <div className="flex flex-col items-start gap-2 sm:items-end">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    document.verification_status ===
                                                    'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : document.verification_status ===
                                                          'rejected'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {document.verification_status}
                                            </span>

                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={form.processing}
                                                    onClick={() =>
                                                        approveDocument(
                                                            document.car_id,
                                                            document.id,
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={form.processing}
                                                    onClick={() =>
                                                        rejectDocument(
                                                            document.car_id,
                                                            document.id,
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </Button>
                                            </div>
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
