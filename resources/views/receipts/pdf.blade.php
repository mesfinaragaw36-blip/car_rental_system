<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt #{{ $payment['id'] }}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background: #f0f9ff;
            color: #1e293b;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10px;
            line-height: 1.5;
        }

        .page {
            width: 100%;
            padding: 0 0 20px 0;
        }

        /* ── Header ── */
        .header {
            background: #2a8fa8;
            padding: 28px 24px 22px;
            text-align: center;
            color: #ffffff;
            border-radius: 0 0 18px 18px;
        }

        .logo-wrap {
            width: 64px;
            height: 64px;
            margin: 0 auto 10px;
            background: #ffffff;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.5);
            overflow: hidden;
            text-align: center;
            line-height: 56px;
        }

        .logo-wrap img {
            width: 56px;
            height: 56px;
            object-fit: cover;
            border-radius: 50%;
        }

        .header-company {
            font-size: 22px;
            font-weight: bold;
            color: #ffffff;
        }

        .header-sub {
            font-size: 8px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.8);
            margin-top: 3px;
        }

        .header-receipt-no {
            display: inline-block;
            margin-top: 12px;
            background: rgba(255,255,255,0.18);
            border-radius: 20px;
            padding: 4px 16px;
            font-size: 10px;
            color: #ffffff;
            letter-spacing: 1px;
        }

        .receipt-icon {
            display: inline-block;
            margin-right: 5px;
            vertical-align: middle;
        }

        /* ── Card wrapper ── */
        .card {
            margin: 16px 20px 0;
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e0f2fe;
            overflow: hidden;
        }

        /* ── Meta row ── */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-cell {
            width: 25%;
            padding: 14px 8px;
            text-align: center;
            border-right: 1px dashed #e0f2fe;
        }

        .meta-cell:last-child { border-right: none; }

        .meta-label {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #94a3b8;
        }

        .meta-value {
            margin-top: 3px;
            font-size: 11px;
            font-weight: bold;
            color: #2a8fa8;
        }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
        }

        .badge-paid    { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .badge-failed  { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        /* ── Divider ── */
        .divider {
            border: none;
            border-top: 1px dashed #e0f2fe;
        }

        /* ── Section inside card ── */
        .section {
            padding: 14px 18px;
            border-top: 1px dashed #e0f2fe;
        }

        .section-heading {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #64748b;
            text-align: center;
            margin-bottom: 10px;
        }

        .section-icon {
            color: #2a8fa8;
            margin-right: 4px;
        }

        /* ── Two-col vehicle/period ── */
        .two-col {
            width: 100%;
            border-collapse: collapse;
        }

        .two-col td {
            width: 50%;
            vertical-align: top;
            text-align: center;
            padding: 0 10px;
        }

        .two-col td:first-child {
            border-right: 1px dashed #e0f2fe;
        }

        .col-heading {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #64748b;
            margin-bottom: 6px;
        }

        .col-main {
            font-size: 13px;
            font-weight: bold;
            color: #1e293b;
        }

        .col-sub {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
        }

        /* ── Billed to ── */
        .billed-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
        }

        .billed-table td {
            width: 33%;
            vertical-align: top;
            padding: 0 8px;
        }

        .billed-label {
            font-size: 8px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .billed-value {
            font-size: 10px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 2px;
        }

        /* ── Breakdown ── */
        .breakdown-table {
            width: 100%;
            border-collapse: collapse;
            max-width: 400px;
            margin: 0 auto;
        }

        .breakdown-table td {
            padding: 3px 0;
            font-size: 9px;
        }

        .bl { color: #64748b; }
        .bv { text-align: right; font-weight: bold; color: #1e293b; }

        .total-row td {
            background: #f0f9ff;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 11px;
            color: #1e293b;
            border-top: 1px solid #e0f2fe;
            border-bottom: 1px solid #e0f2fe;
        }

        .shield-row td {
            background: #f0f9ff;
            padding: 5px 10px;
            font-size: 9px;
            color: #0369a1;
            border: 1px solid #bae6fd;
        }

        .subtotal-divider td {
            padding: 3px 0;
            border-top: 1px solid #e0f2fe;
        }

        /* ── Payment details ── */
        .pay-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
        }

        .pay-table td {
            width: 25%;
            vertical-align: top;
            padding: 0 6px;
        }

        .pay-label {
            font-size: 7px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .pay-value {
            font-size: 10px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 2px;
        }

        .pay-amount {
            font-size: 14px;
            font-weight: bold;
            color: #2a8fa8;
            margin-top: 2px;
        }

        /* ── Refunds ── */
        .refund-row td {
            padding: 6px 10px;
            background: #f8fafc;
            border: 1px solid #e0f2fe;
            border-radius: 6px;
            margin-bottom: 4px;
        }

        /* ── Footer ── */
        .footer {
            margin-top: 16px;
            text-align: center;
            color: #94a3b8;
            font-size: 8px;
            padding: 0 20px;
        }

        .footer p { margin-top: 3px; }
    </style>
</head>
<body>
@php
    $badgeClass = match($payment['payment_status']) {
        'paid'    => 'badge-paid',
        'pending' => 'badge-pending',
        default   => 'badge-failed',
    };
@endphp

<div class="page">

    {{-- HEADER --}}
    <div class="header">
        <div class="logo-wrap">
            <span style="font-size:11px; font-weight:bold; color:#2a8fa8; line-height:56px;">{{ strtoupper(substr($companyName, 0, 2)) }}</span>
        </div>

        <div class="header-company">{{ $companyName }}</div>
        <div class="header-sub">Official Payment Receipt</div>
        <div class="header-receipt-no">
            &#9635; &nbsp; Receipt No. &nbsp;<strong>#{{ $payment['id'] }}</strong>
        </div>
    </div>

    {{-- CARD --}}
    <div class="card">

        {{-- META ROW --}}
        <table class="meta-table">
            <tr>
                <td class="meta-cell">
                    <div class="meta-label">Booking Ref</div>
                    <div class="meta-value">#{{ $booking['id'] }}</div>
                </td>
                <td class="meta-cell">
                    <div class="meta-label">Payment Type</div>
                    <div class="meta-value" style="font-size:10px;">{{ $payment['type_label'] }}</div>
                </td>
                <td class="meta-cell">
                    <div class="meta-label">Date Issued</div>
                    <div class="meta-value">
                        {{ $payment['paid_at'] ? \Carbon\Carbon::parse($payment['paid_at'])->format('n/j/Y') : 'N/A' }}
                    </div>
                </td>
                <td class="meta-cell">
                    <div class="meta-label">Status</div>
                    <div style="margin-top:3px;">
                        <span class="badge {{ $badgeClass }}">{{ $payment['payment_status'] }}</span>
                    </div>
                </td>
            </tr>
        </table>

        {{-- VEHICLE + PERIOD --}}
        <div class="section">
            <table class="two-col">
                <tr>
                    <td>
                        <div class="col-heading">&#9906; &nbsp; Vehicle</div>
                        <div class="col-main">{{ $car ? $car['brand'].' '.$car['model'] : 'N/A' }}</div>
                        <div class="col-sub">Plate: <strong>{{ $car['plate_number'] ?? 'N/A' }}</strong></div>
                    </td>
                    <td>
                        <div class="col-heading">&#128197; &nbsp; Rental Period</div>
                        <div class="col-main">{{ $booking['pickup_date'] }} &rarr; {{ $booking['return_date'] }}</div>
                        <div class="col-sub">{{ $booking['pickup_location'] }} &rarr; {{ $booking['return_location'] }}</div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- BILLED TO --}}
        @if($customer)
        <div class="section">
            <div class="section-heading">Billed To</div>
            <table class="billed-table">
                <tr>
                    <td>
                        <div class="billed-label">Name</div>
                        <div class="billed-value">{{ $customer['name'] }}</div>
                    </td>
                    <td>
                        <div class="billed-label">Email</div>
                        <div class="billed-value">{{ $customer['email'] }}</div>
                    </td>
                    <td>
                        <div class="billed-label">Phone</div>
                        <div class="billed-value">{{ $customer['phone'] }}</div>
                    </td>
                </tr>
            </table>
        </div>
        @endif

        {{-- COST BREAKDOWN --}}
        <div class="section">
            <div class="section-heading">&#9999; &nbsp; Cost Breakdown</div>
            <table class="breakdown-table">
                <tr>
                    <td class="bl">Daily Price (&times; {{ $booking['days'] }} day{{ $booking['days'] === 1 ? '' : 's' }})</td>
                    <td class="bv">ETB {{ $booking['daily_rate'] }}</td>
                </tr>
                <tr>
                    <td class="bl">Rental Subtotal</td>
                    <td class="bv">ETB {{ $booking['subtotal'] }}</td>
                </tr>
                @if($booking['need_driver'] && (float)$booking['driver_fee'] > 0)
                <tr>
                    <td class="bl">Driver Fee</td>
                    <td class="bv">ETB {{ $booking['driver_fee'] }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td class="bl">Rental Total</td>
                    <td class="bv" style="text-align:right; font-size:13px;">ETB {{ $booking['total_price'] }}</td>
                </tr>
                <tr><td style="padding:4px 0;"></td><td></td></tr>
                <tr>
                    <td class="bl">First Deposit</td>
                    <td class="bv">ETB {{ $booking['deposit_amount'] }}</td>
                </tr>
                <tr>
                    <td class="bl">Full Deposit &minus; First Deposit</td>
                    <td class="bv">ETB {{ $booking['full_deposit_balance'] }}</td>
                </tr>
                <tr class="shield-row">
                    <td class="bl" style="color:#0369a1;">&#9679; &nbsp; Safety Deposit</td>
                    <td class="bv" style="text-align:right; color:#0369a1;">ETB {{ $booking['security_deposit'] }}</td>
                </tr>
                <tr class="subtotal-divider"><td></td><td></td></tr>
                <tr>
                    <td class="bl">Paid To Date</td>
                    <td class="bv">ETB {{ $booking['paid_to_date'] }}</td>
                </tr>
                <tr>
                    <td class="bl">Amount Due</td>
                    <td class="bv">ETB {{ $booking['balance_remaining'] }}</td>
                </tr>
            </table>
        </div>

        {{-- PAYMENT DETAILS --}}
        <div class="section">
            <div class="section-heading">Payment Details</div>
            <table class="pay-table">
                <tr>
                    <td>
                        <div class="pay-label">Method</div>
                        <div class="pay-value">{{ $payment['payment_method'] }}</div>
                    </td>
                    <td>
                        <div class="pay-label">Reference</div>
                        <div class="pay-value">{{ $payment['transaction_reference'] ?? 'N/A' }}</div>
                    </td>
                    <td>
                        <div class="pay-label">Paid At</div>
                        <div class="pay-value">
                            {{ $payment['paid_at'] ? \Carbon\Carbon::parse($payment['paid_at'])->format('M j, Y H:i') : 'N/A' }}
                        </div>
                    </td>
                    <td>
                        <div class="pay-label">Amount Paid</div>
                        <div class="pay-amount">ETB {{ $payment['amount'] }}</div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- REFUNDS --}}
        @if(count($refunds) > 0)
        <div class="section">
            <div class="section-heading">&#8634; &nbsp; Refunds</div>
            @foreach($refunds as $refund)
            <table style="width:100%; border-collapse:collapse; margin-bottom:5px;">
                <tr class="refund-row">
                    <td>
                        <strong style="color:#1e293b;">{{ $refund['reason'] }}</strong><br>
                        <span style="color:#64748b; font-size:8px;">
                            {{ ucfirst($refund['status']) }}{{ $refund['processed_at'] ? ' &middot; '.\Carbon\Carbon::parse($refund['processed_at'])->format('M j, Y') : '' }}
                        </span>
                    </td>
                    <td style="text-align:right; font-weight:bold; color:#1e293b;">ETB {{ $refund['amount'] }}</td>
                </tr>
            </table>
            @endforeach
        </div>
        @endif

    </div>{{-- /card --}}

    {{-- FOOTER --}}
    <div class="footer">
        <p>Thank you for choosing {{ $companyName }}.</p>
        <p>This receipt was issued for booking #{{ $booking['id'] }}. Keep it for your records.</p>
        <p>Generated on {{ \Carbon\Carbon::now()->format('F j, Y \a\t H:i') }}</p>
    </div>

</div>
</body>
</html>
