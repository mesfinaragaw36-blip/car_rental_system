import { useForm } from '@inertiajs/react';

export default function Payment({ booking }: any) {

    const { data, setData, post, processing } = useForm({
        payment_method: '',
        transaction_reference: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/bookings/${booking.id}/payment`);
    };

    return (
        <div>
            <h1>Make Payment</h1>

            <p>
                Amount: {booking.total_price}
            </p>

            <form onSubmit={submit}>

                <label>
                    Payment Method
                </label>

                <select
                    value={data.payment_method}
                    onChange={(e) =>
                        setData('payment_method', e.target.value)
                    }
                >
                    <option value="">
                        Select Method
                    </option>

                    <option value="Telebirr">
                        Telebirr
                    </option>

                    <option value="CBE Birr">
                        CBE Birr
                    </option>
                </select>


                <label>
                    Transaction Reference
                </label>

                <input
                    type="text"
                    value={data.transaction_reference}
                    onChange={(e) =>
                        setData(
                            'transaction_reference',
                            e.target.value
                        )
                    }
                />


                <button type="submit" disabled={processing}>
                    Pay Now
                </button>

            </form>
        </div>
    );
}