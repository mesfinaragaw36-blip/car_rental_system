export default function PaymentHistory({ payments }: { payments: any[] }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Received Payments
            </h1>

            {payments.length === 0 ? (
                <p className="text-gray-500">
                    No payments received yet.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white shadow rounded-lg">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border text-left">
                                    Customer
                                </th>
                                <th className="p-3 border text-left">
                                    Vehicle
                                </th>
                                <th className="p-3 border text-left">
                                    Amount
                                </th>
                                <th className="p-3 border text-left">
                                    Method
                                </th>
                                <th className="p-3 border text-left">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((payment: any) => (
                                <tr key={payment.id}>
                                    <td className="p-3 border">
                                        {payment.booking.customer.name}
                                    </td>

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
                                        {payment.payment_status}
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