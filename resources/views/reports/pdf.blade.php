<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <title>{{ $report['title'] ?? 'Rental Business Report' }}</title>

    <style>
        @page {
            size: A4;
            margin: 18mm 15mm 18mm 15mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #1e293b;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10px;
            line-height: 1.5;
        }

        .page {
            width: 100%;
        }

        .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 18px;
            margin-bottom: 24px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-left {
            width: 65%;
            vertical-align: top;
        }

        .header-right {
            width: 35%;
            vertical-align: top;
            text-align: right;
        }

        .company {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 3px;
        }

        .subtitle {
            font-size: 9px;
            color: #94a3b8;
        }

        .report-title {
            margin-top: 15px;
            margin-bottom: 4px;
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
        }

        .report-description {
            color: #64748b;
            font-size: 10px;
        }

        .meta-label {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
        }

        .meta-value {
            margin-top: 2px;
            font-size: 10px;
            font-weight: bold;
            color: #334155;
        }

        .meta-block {
            margin-bottom: 12px;
        }

        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .section-title-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .section-number {
            width: 27px;
            height: 27px;
            background: #0f172a;
            color: #ffffff;
            text-align: center;
            vertical-align: middle;
            font-size: 9px;
            font-weight: bold;
        }

        .section-title {
            padding-left: 9px;
            border-bottom: 1px solid #cbd5e1;
            vertical-align: middle;
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
        }

        .summary-cell {
            width: 25%;
            padding: 12px;
            border-right: 1px solid #cbd5e1;
            vertical-align: top;
        }

        .summary-cell:last-child {
            border-right: none;
        }

        .summary-label {
            color: #94a3b8;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.7px;
        }

        .summary-value {
            margin-top: 4px;
            color: #0f172a;
            font-size: 14px;
            font-weight: bold;
        }

        .metrics-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .metric {
            width: 33.33%;
            border-left: 2px solid #cbd5e1;
            padding: 5px 10px;
            vertical-align: top;
        }

        .metric-label {
            color: #64748b;
            font-size: 8px;
        }

        .metric-value {
            margin-top: 2px;
            color: #334155;
            font-size: 10px;
            font-weight: bold;
        }

        .report-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
        }

        .report-table th {
            background: #f8fafc;
            border-bottom: 1px solid #cbd5e1;
            padding: 8px 9px;
            text-align: left;
            color: #64748b;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .report-table td {
            padding: 8px 9px;
            border-bottom: 1px solid #e2e8f0;
            color: #475569;
            font-size: 9px;
        }

        .report-table tr:last-child td {
            border-bottom: none;
        }

        .amount {
            text-align: right;
            font-weight: bold;
            color: #0f172a !important;
        }

        .two-column {
            width: 100%;
            border-collapse: collapse;
        }

        .two-column > tbody > tr > td {
            width: 50%;
            vertical-align: top;
        }

        .two-column > tbody > tr > td:first-child {
            padding-right: 7px;
        }

        .two-column > tbody > tr > td:last-child {
            padding-left: 7px;
        }

        .subsection-title {
            margin: 0 0 8px 0;
            color: #334155;
            font-size: 10px;
            font-weight: bold;
        }

        .revenue-table {
            width: 100%;
            border-collapse: collapse;
        }

        .revenue-table td {
            padding: 5px 0;
            vertical-align: middle;
        }

        .revenue-date {
            width: 85px;
            color: #64748b;
            font-size: 8px;
        }

        .revenue-bar-cell {
            padding-left: 8px !important;
            padding-right: 8px !important;
        }

        .bar-background {
            height: 9px;
            width: 100%;
            background: #f1f5f9;
        }

        .bar {
            height: 9px;
            background: #334155;
        }

        .revenue-amount {
            width: 90px;
            text-align: right;
            color: #334155;
            font-size: 8px;
            font-weight: bold;
        }

        .empty {
            border: 1px dashed #cbd5e1;
            padding: 14px;
            text-align: center;
            color: #94a3b8;
            font-size: 9px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 2px solid #0f172a;
        }

        .footer-table {
            width: 100%;
            border-collapse: collapse;
        }

        .footer-left {
            text-align: left;
            color: #94a3b8;
            font-size: 7px;
        }

        .footer-right {
            text-align: right;
            color: #94a3b8;
            font-size: 7px;
        }

        .page-break {
            page-break-before: always;
        }
    </style>
</head>

<body>

@php
    $from = $report['from'] ?? null;
    $to = $report['to'] ?? null;

    $formatDate = function ($date) {
        if (!$date) {
            return 'All available dates';
        }

        return \Carbon\Carbon::parse($date)->format('F j, Y');
    };

    $formatMoney = function ($value) {
        return number_format((float) $value, 2);
    };

    $formatLabel = function ($value) {
        return ucwords(str_replace('_', ' ', $value));
    };

    $reportPeriod = ($from || $to)
        ? $formatDate($from) . ' - ' . $formatDate($to)
        : 'All available dates';

    $maxRevenue = max(
        collect($revenueByDate ?? [])
            ->map(fn ($item) => (float) ($item['total'] ?? 0))
            ->max() ?? 1,
        1
    );
@endphp

<div class="page">

    {{-- HEADER --}}
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="header-left">
                    <div class="company">
                        {{ $report['company_name'] ?? 'Ethio Car Rental' }}
                    </div>

                    <div class="subtitle">
                        {{ $report['subtitle'] ?? 'Administrative Report' }}
                    </div>

                    <div class="report-title">
                        {{ $report['title'] ?? 'Rental Business Report' }}
                    </div>

                    <div class="report-description">
                        Comprehensive operational and financial report
                    </div>
                </td>

                <td class="header-right">
                    <div class="meta-block">
                        <div class="meta-label">
                            Report Period
                        </div>

                        <div class="meta-value">
                            {{ $reportPeriod }}
                        </div>
                    </div>

                    <div class="meta-block">
                        <div class="meta-label">
                            Generated
                        </div>

                        <div class="meta-value">
                            {{ \Carbon\Carbon::parse($report['generated_at'] ?? now())->format('F j, Y') }}
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>


    {{-- 01 EXECUTIVE SUMMARY --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    01
                </td>

                <td class="section-title">
                    Executive Summary
                </td>
            </tr>
        </table>

        <table class="summary-table">
            <tr>
                <td class="summary-cell">
                    <div class="summary-label">
                        Total Bookings
                    </div>

                    <div class="summary-value">
                        {{ $summary['total_bookings'] ?? 0 }}
                    </div>
                </td>

                <td class="summary-cell">
                    <div class="summary-label">
                        Completed
                    </div>

                    <div class="summary-value">
                        {{ $summary['completed_bookings'] ?? 0 }}
                    </div>
                </td>

                <td class="summary-cell">
                    <div class="summary-label">
                        Total Revenue
                    </div>

                    <div class="summary-value">
                        ETB {{ $formatMoney($summary['total_revenue'] ?? 0) }}
                    </div>
                </td>

                <td class="summary-cell">
                    <div class="summary-label">
                        Commission
                    </div>

                    <div class="summary-value">
                        ETB {{ $formatMoney($summary['company_commission'] ?? 0) }}
                    </div>
                </td>
            </tr>
        </table>

        <table class="metrics-table">
            <tr>
                <td class="metric">
                    <div class="metric-label">
                        Confirmed Bookings
                    </div>

                    <div class="metric-value">
                        {{ $summary['confirmed_bookings'] ?? 0 }}
                    </div>
                </td>

                <td class="metric">
                    <div class="metric-label">
                        Cancelled Bookings
                    </div>

                    <div class="metric-value">
                        {{ $summary['cancelled_bookings'] ?? 0 }}
                    </div>
                </td>

                <td class="metric">
                    <div class="metric-label">
                        Total Payments Received
                    </div>

                    <div class="metric-value">
                        ETB {{ $formatMoney($summary['total_payments'] ?? 0) }}
                    </div>
                </td>
            </tr>
        </table>
    </div>


    {{-- 02 FINANCIAL SUMMARY --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    02
                </td>

                <td class="section-title">
                    Financial Summary
                </td>
            </tr>
        </table>

        <table class="report-table">
            <thead>
                <tr>
                    <th>
                        Financial Item
                    </th>

                    <th style="text-align: right;">
                        Amount
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>Rental Revenue</td>
                    <td class="amount">
                        ETB {{ $formatMoney($summary['rental_revenue'] ?? 0) }}
                    </td>
                </tr>

                <tr>
                    <td>Extra Charges</td>
                    <td class="amount">
                        ETB {{ $formatMoney($summary['extra_charges'] ?? 0) }}
                    </td>
                </tr>

                <tr>
                    <td>Total Revenue</td>
                    <td class="amount">
                        ETB {{ $formatMoney($summary['total_revenue'] ?? 0) }}
                    </td>
                </tr>

                <tr>
                    <td>Security Deposits</td>
                    <td class="amount">
                        ETB {{ $formatMoney($summary['security_deposits'] ?? 0) }}
                    </td>
                </tr>

                <tr>
                    <td>Company Commission</td>
                    <td class="amount">
                        ETB {{ $formatMoney($summary['company_commission'] ?? 0) }}
                    </td>
                </tr>

                <tr>
                    <td>Total Refunds</td>
                    <td class="amount">
                        ETB {{ $formatMoney($summary['total_refunds'] ?? 0) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>


    {{-- 03 PAYOUT SUMMARY --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    03
                </td>

                <td class="section-title">
                    Payout Summary
                </td>
            </tr>
        </table>

        <table class="two-column">
            <tr>

                <td>
                    <div class="subsection-title">
                        Owner Payouts
                    </div>

                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>Total</td>
                                <td class="amount">
                                    ETB {{ $formatMoney($summary['owner_payouts'] ?? 0) }}
                                </td>
                            </tr>

                            <tr>
                                <td>Paid</td>
                                <td class="amount">
                                    ETB {{ $formatMoney($summary['paid_owner_payouts'] ?? 0) }}
                                </td>
                            </tr>

                            <tr>
                                <td>Pending</td>
                                <td class="amount">
                                    ETB {{ $formatMoney($summary['pending_owner_payouts'] ?? 0) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <td>
                    <div class="subsection-title">
                        Driver Payouts
                    </div>

                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>Total</td>
                                <td class="amount">
                                    ETB {{ $formatMoney($summary['driver_payouts'] ?? 0) }}
                                </td>
                            </tr>

                            <tr>
                                <td>Paid</td>
                                <td class="amount">
                                    ETB {{ $formatMoney($summary['paid_driver_payouts'] ?? 0) }}
                                </td>
                            </tr>

                            <tr>
                                <td>Pending</td>
                                <td class="amount">
                                    ETB {{ $formatMoney($summary['pending_driver_payouts'] ?? 0) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>

            </tr>
        </table>
    </div>


    {{-- 04 BOOKING ANALYSIS --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    04
                </td>

                <td class="section-title">
                    Booking Analysis
                </td>
            </tr>
        </table>

        @if (!empty($bookingStatuses))

            <table class="report-table">
                <thead>
                    <tr>
                        <th>Booking Status</th>
                        <th>Number of Bookings</th>
                        <th>Share</th>
                    </tr>
                </thead>

                <tbody>
                    @foreach ($bookingStatuses as $status => $count)

                        @php
                            $share = (($summary['total_bookings'] ?? 0) > 0)
                                ? (($count / $summary['total_bookings']) * 100)
                                : 0;
                        @endphp

                        <tr>
                            <td>
                                {{ $formatLabel($status) }}
                            </td>

                            <td>
                                {{ $count }}
                            </td>

                            <td class="amount">
                                {{ number_format($share, 1) }}%
                            </td>
                        </tr>

                    @endforeach
                </tbody>
            </table>

        @else

            <div class="empty">
                No booking data available for this report period.
            </div>

        @endif
    </div>


    {{-- 05 PAYMENT ANALYSIS --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    05
                </td>

                <td class="section-title">
                    Payment Analysis
                </td>
            </tr>
        </table>

        <table class="two-column">
            <tr>

                <td>
                    <div class="subsection-title">
                        Payments by Type
                    </div>

                    @if (!empty($paymentTypes))

                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Payment Type</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                @foreach ($paymentTypes as $type => $amount)

                                    <tr>
                                        <td>
                                            {{ $formatLabel($type) }}
                                        </td>

                                        <td class="amount">
                                            ETB {{ $formatMoney($amount) }}
                                        </td>
                                    </tr>

                                @endforeach
                            </tbody>
                        </table>

                    @else

                        <div class="empty">
                            No payment data available.
                        </div>

                    @endif
                </td>

                <td>
                    <div class="subsection-title">
                        Payments by Method
                    </div>

                    @if (!empty($paymentMethods))

                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Payment Method</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                @foreach ($paymentMethods as $method => $amount)

                                    <tr>
                                        <td>
                                            {{ $formatLabel($method) }}
                                        </td>

                                        <td class="amount">
                                            ETB {{ $formatMoney($amount) }}
                                        </td>
                                    </tr>

                                @endforeach
                            </tbody>
                        </table>

                    @else

                        <div class="empty">
                            No payment data available.
                        </div>

                    @endif
                </td>

            </tr>
        </table>
    </div>


    {{-- 06 REVENUE TREND --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    06
                </td>

                <td class="section-title">
                    Revenue Trend
                </td>
            </tr>
        </table>

        @if (!empty($revenueByDate))

            <table class="revenue-table">

                @foreach ($revenueByDate as $item)

                    @php
                        $revenue = (float) ($item['total'] ?? 0);

                        $width = $maxRevenue > 0
                            ? max(($revenue / $maxRevenue) * 100, 2)
                            : 2;
                    @endphp

                    <tr>
                        <td class="revenue-date">
                            {{ \Carbon\Carbon::parse($item['date'])->format('M j, Y') }}
                        </td>

                        <td class="revenue-bar-cell">
                            <div class="bar-background">
                                <div
                                    class="bar"
                                    style="width: {{ $width }}%;"
                                ></div>
                            </div>
                        </td>

                        <td class="revenue-amount">
                            ETB {{ $formatMoney($revenue) }}
                        </td>
                    </tr>

                @endforeach

            </table>

        @else

            <div class="empty">
                No revenue data available for this report period.
            </div>

        @endif
    </div>


    {{-- 07 FLEET PERFORMANCE --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    07
                </td>

                <td class="section-title">
                    Fleet Performance
                </td>
            </tr>
        </table>

        <table class="summary-table">
            <tr>
                <td class="summary-cell">
                    <div class="summary-label">
                        Total Cars
                    </div>

                    <div class="summary-value">
                        {{ $summary['total_cars'] ?? 0 }}
                    </div>
                </td>

                <td class="summary-cell">
                    <div class="summary-label">
                        Available
                    </div>

                    <div class="summary-value">
                        {{ $summary['available_cars'] ?? 0 }}
                    </div>
                </td>

                <td class="summary-cell">
                    <div class="summary-label">
                        Currently Booked
                    </div>

                    <div class="summary-value">
                        {{ $summary['booked_cars'] ?? 0 }}
                    </div>
                </td>
            </tr>
        </table>

        <div style="margin-top: 12px;">
            <div class="subsection-title">
                Top Cars by Bookings
            </div>

            @if (!empty($topCars) && count($topCars) > 0)

                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Vehicle</th>
                            <th>Plate Number</th>
                            <th style="text-align: right;">Bookings</th>
                        </tr>
                    </thead>

                    <tbody>
                        @foreach ($topCars as $index => $car)

                            <tr>
                                <td>
                                    {{ $index + 1 }}
                                </td>

                                <td>
                                    {{ $car['car'] ?? 'Unknown' }}
                                </td>

                                <td>
                                    {{ $car['plate_number'] ?? 'Not available' }}
                                </td>

                                <td class="amount">
                                    {{ $car['bookings_count'] ?? 0 }}
                                </td>
                            </tr>

                        @endforeach
                    </tbody>
                </table>

            @else

                <div class="empty">
                    No vehicle booking data available.
                </div>

            @endif
        </div>
    </div>


    {{-- 08 INSPECTION REPORT --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    08
                </td>

                <td class="section-title">
                    Inspection Report
                </td>
            </tr>
        </table>

        <table class="report-table">
            <thead>
                <tr>
                    <th>Inspection Result</th>
                    <th style="text-align: right;">Count</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>Total Inspections</td>

                    <td class="amount">
                        {{ $summary['total_inspections'] ?? 0 }}
                    </td>
                </tr>

                <tr>
                    <td>Approved</td>

                    <td class="amount">
                        {{ $summary['approved_inspections'] ?? 0 }}
                    </td>
                </tr>

                <tr>
                    <td>Issues Found</td>

                    <td class="amount">
                        {{ $summary['issues_found'] ?? 0 }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>


    {{-- 09 REFUND REPORT --}}
    <div class="section">

        <table class="section-title-table">
            <tr>
                <td class="section-number">
                    09
                </td>

                <td class="section-title">
                    Refund Report
                </td>
            </tr>
        </table>

        <table class="metrics-table">
            <tr>
                <td class="metric">
                    <div class="metric-label">
                        Processed Refunds
                    </div>

                    <div class="metric-value">
                        ETB {{ $formatMoney($summary['processed_refunds'] ?? 0) }}
                    </div>
                </td>

                <td class="metric">
                    <div class="metric-label">
                        Pending Refunds
                    </div>

                    <div class="metric-value">
                        ETB {{ $formatMoney($summary['pending_refunds'] ?? 0) }}
                    </div>
                </td>

                <td class="metric">
                    <div class="metric-label">
                        Total Refunds
                    </div>

                    <div class="metric-value">
                        ETB {{ $formatMoney($summary['total_refunds'] ?? 0) }}
                    </div>
                </td>
            </tr>
        </table>

        <div style="margin-top: 10px;">

            @if (!empty($refundStatuses))

                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Refund Status</th>
                            <th>Count</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        @foreach ($refundStatuses as $status => $data)

                            <tr>
                                <td>
                                    {{ $formatLabel($status) }}
                                </td>

                                <td>
                                    {{ $data['count'] ?? 0 }}
                                </td>

                                <td class="amount">
                                    ETB {{ $formatMoney($data['amount'] ?? 0) }}
                                </td>
                            </tr>

                        @endforeach
                    </tbody>
                </table>

            @else

                <div class="empty">
                    No refund data available for this report period.
                </div>

            @endif

        </div>
    </div>


    {{-- FOOTER --}}
    <div class="footer">

        <table class="footer-table">
            <tr>
                <td class="footer-left">
                    {{ $report['company_name'] ?? 'Ethio Car Rental' }}
                    ·
                    {{ $report['subtitle'] ?? 'Administrative Report' }}
                </td>

                <td class="footer-right">
                    Generated on
                    {{ \Carbon\Carbon::parse($report['generated_at'] ?? now())->format('F j, Y') }}
                </td>
            </tr>
        </table>

    </div>

</div>

</body>
</html>