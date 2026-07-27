
export default function PaymentHistory({ payments }: { payments: any[] }) {

    return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
            Payment History
        </h1>

        {payments.length === 0 ? (
            <p className="text-gray-500">
                No payments found.
            </p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow rounded-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left border">
                                Vehicle
                            </th>
                            <th className="p-3 text-left border">
                                Amount
                            </th>
                            <th className="p-3 text-left border">
                                Method
                            </th>
                            <th className="p-3 text-left border">
                                Reference
                            </th>
                            <th className="p-3 text-left border">
                                Status
                            </th>
                            <th className="p-3 text-left border">
                                Date
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {payments.map((payment: any) => (
                            <tr key={payment.id} className="hover:bg-gray-50">

                                <td className="p-3 border">
                                    {payment.booking.car.brand} {payment.booking.car.model}
                                </td>

                                <td className="p-3 border">
                                    {payment.amount}
                                </td>

                                <td className="p-3 border">
                                    {payment.payment_method}
                                </td>

                                <td className="p-3 border">
                                    {payment.transaction_reference}
                                </td>

                                <td className="p-3 border">
                                    {payment.payment_status}
                                </td>

                                <td className="p-3 border">
                                    {payment.paid_at}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);
    }