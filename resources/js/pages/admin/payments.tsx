export default function Payments({
    payments,
    totalRevenue,
}: {
    payments: any[];
    totalRevenue: number;
}) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Payment Management
            </h1>

            <div className="mb-6 bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-semibold">
                    Total Revenue
                </h2>

                <p className="text-2xl font-bold">
                    {totalRevenue} ETB
                </p>
            </div>

            {payments.length === 0 ? (
                <p className="text-gray-500">
                    No payments found.
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
                                    Owner
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
                                        {payment.booking.owner.name}
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