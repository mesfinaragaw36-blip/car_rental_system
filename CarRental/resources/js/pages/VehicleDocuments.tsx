import { Head } from '@inertiajs/react';

interface Document {
    id: number;
    car_id: number;
    document_type: string;
    document_path: string;
    verification_status: string;
}

interface Props {
    documents: Document[];
}

export default function VehicleDocuments({ documents = [] }: Props) {
    return (
        <>
            <Head title="Vehicle Documents" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Vehicle Documents
                </h1>

                <div className="mt-6 rounded-lg border p-6">
                    {documents.length === 0 ? (
                        <p>No vehicle documents available.</p>
                    ) : (
                        documents.map((document) => (
                            <div key={document.id} className="border-b py-3">
                                <p>Car ID: {document.car_id}</p>
                                <p>Type: {document.document_type}</p>
                                <p>Path: {document.document_path}</p>
                                <p>
                                    Status: {document.verification_status}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}