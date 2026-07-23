import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Document {
    id: number;
    car_id: number;
    document_type: string;
    document_path: string;
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
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {document.car.brand}{' '}
                                                {document.car.model}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {document.document_type} &middot;{' '}
                                                {document.document_path}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                            {document.verification_status}
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
