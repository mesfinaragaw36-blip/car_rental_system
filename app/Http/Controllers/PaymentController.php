<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Inspection;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use App\Services\DriverMatchingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private readonly DriverMatchingService $driverMatching
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Payment Methods
    |--------------------------------------------------------------------------
    |
    | These are the payment methods currently supported by the system.
    | Customer-submitted payments are recorded and applied immediately.
    |
    */
    private const PAYMENT_METHODS = [
        'Telebirr',
        'CBE Birr',
        'Telebirr',
    ];

    /**
     * Display payments.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Payment::with(
            'booking.car',
            'booking.customer',
            'booking.owner'
        );

        if ($user->role === 'admin') {
            if ($request->filled('status')) {
                $query->where(
                    'payment_status',
                    $request->input('status')
                );
            }

            if ($request->filled('search')) {
                $search = $request->input('search');

                $query->whereHas(
                    'booking.customer',
                    fn ($q) => $q->where(
                        'name',
                        'like',
                        "%{$search}%"
                    )
                );
            }
        } elseif ($user->role === 'owner') {
            $query->whereHas(
                'booking',
                fn ($q) => $q->where(
                    'owner_id',
                    $user->id
                )
            );
        } else {
            $query->whereHas(
                'booking',
                fn ($q) => $q->where(
                    'customer_id',
                    $user->id
                )
            );
        }

        $payments = $query
            ->latest()
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'type' => $payment->type,
                'payment_method' => $payment->payment_method,
                'payment_status' => $payment->payment_status,
                'amount' => $payment->amount,
                'transaction_reference' => $payment->transaction_reference,
                'paid_at' => $payment->paid_at?->toDateTimeString(),
                'booking_id' => $payment->booking_id,

                'customer' => $payment->booking->customer
                    ? [
                        'id' => $payment->booking->customer->id,
                        'name' => $payment->booking->customer->name,
                    ]
                    : null,

                'car' => $payment->booking->car
                    ? [
                        'brand' => $payment->booking->car->brand,
                        'model' => $payment->booking->car->model,
                        'plate_number' => $payment->booking->car->plate_number,
                    ]
                    : null,

                'leverage_document_status' => $payment->booking->leverage_document_status,
            ]);

        return Inertia::render('payments', [
            'role' => $user->role,
            'payments' => $payments,
            'filters' => $request->only([
                'status',
                'search',
            ]),
        ]);
    }

    /**
     * Show booking deposit payment page.
     */
    public function create(
        Booking $booking
    ): Response|RedirectResponse {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        if (
            $booking->status !==
            Booking::STATUS_CONFIRMED
        ) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking is not awaiting a deposit payment.',
            ]);
        }

        if ($booking->hasPaidDeposit()) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking has already received a deposit payment.',
            ]);
        }

        /*
         * Prevent duplicate pending deposit payments.
         */
        $pendingDeposit = $booking->payments()
            ->where(
                'type',
                Payment::TYPE_DEPOSIT
            )
            ->where(
                'payment_status',
                'pending'
            )
            ->exists();

        if ($pendingDeposit) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'A deposit payment has already been submitted for this booking.',
            ]);
        }

        if ($this->customerIdentityNotApproved($user)) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Your national ID is awaiting admin approval. You can pay the deposit once your identity has been verified.',
            ]);
        }

        $booking->load(
            'car',
            'driverAssignment.driver'
        );

        return Inertia::render('payment', [
            'mode' => 'deposit',

            'payment_methods' => self::PAYMENT_METHODS,

            'booking' => [
                'id' => $booking->id,

                'total_price' => round(
                    (float) $booking->total_price,
                    2
                ),

                'deposit_amount' => round(
                    $booking->depositAmount(),
                    2
                ),

                'balance_amount' => round(
                    $booking->balanceAmount(),
                    2
                ),

                'security_deposit_amount' => round(
                    $booking->securityDepositAmount(),
                    2
                ),

                'pickup_date' => $booking->pickup_date->toDateString(),

                'return_date' => $booking->return_date->toDateString(),

                'pickup_location' => $booking->pickup_location,

                'return_location' => $booking->return_location,

                'car' => $booking->car?->only([
                    'brand',
                    'model',
                    'plate_number',
                ]),

                'need_driver' => $booking->need_driver,

                'driver' => $booking->driverAssignment?->driver
                    ? [
                        'name' => $booking
                            ->driverAssignment
                            ->driver
                            ->name,
                    ]
                    : null,
            ],

            'role' => $user->role,
        ]);
    }

    /**
     * Show pickup balance payment page.
     */
    public function createPickup(
        Request $request,
        Booking $booking
    ): Response|RedirectResponse {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        if (
            $booking->status !==
            Booking::STATUS_DEPOSIT_PAID
        ) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking is not awaiting the pickup balance payment.',
            ]);
        }

        if ($booking->hasPaidBalance()) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'The balance has already been paid for this booking.',
            ]);
        }

        if (
            ! $booking->hasApprovedInspection(
                Inspection::TYPE_PICKUP
            )
        ) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'You can pay the balance once the vehicle passes the pickup inspection.',
            ]);
        }

        /*
         * Prevent duplicate pending pickup payments.
         */
        $pendingPickupPayment = $booking->payments()
            ->whereIn('type', [
                Payment::TYPE_BALANCE,
                Payment::TYPE_SECURITY_DEPOSIT,
            ])
            ->where(
                'payment_status',
                'pending'
            )
            ->exists();

        if ($pendingPickupPayment) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'A pickup payment is already awaiting processing.',
            ]);
        }

        $booking->load(
            'car',
            'driverAssignment.driver'
        );

        $paySecurityDeposit = $request->boolean(
            'security_deposit',
            true
        );

        return Inertia::render('payment', [
            'mode' => 'pickup',

            'pay_security_deposit' => $paySecurityDeposit,

            'payment_methods' => self::PAYMENT_METHODS,

            'booking' => [
                'id' => $booking->id,

                'total_price' => round(
                    (float) $booking->total_price,
                    2
                ),

                'deposit_amount' => round(
                    $booking->depositAmount(),
                    2
                ),

                'balance_amount' => round(
                    $booking->balanceAmount(),
                    2
                ),

                'security_deposit_amount' => round(
                    $booking->securityDepositAmount(),
                    2
                ),

                'pickup_date' => $booking->pickup_date->toDateString(),

                'return_date' => $booking->return_date->toDateString(),

                'pickup_location' => $booking->pickup_location,

                'return_location' => $booking->return_location,

                'car' => $booking->car?->only([
                    'brand',
                    'model',
                    'plate_number',
                ]),

                'need_driver' => $booking->need_driver,

                'driver' => $booking->driverAssignment?->driver
                    ? [
                        'name' => $booking
                            ->driverAssignment
                            ->driver
                            ->name,
                    ]
                    : null,

                'has_leverage_document' => $booking->hasLeverageDocument(),
            ],

            'role' => $user->role,
        ]);
    }

    /**
     * Show extra charge payment page.
     */
    public function createExtraCharge(
        Booking $booking
    ): Response|RedirectResponse {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        $extraCharge = $booking->payments()
            ->where(
                'type',
                Payment::TYPE_EXTRA_CHARGE
            )
            ->where(
                'payment_status',
                'pending'
            )
            ->latest()
            ->first();

        if (! $extraCharge) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'There is no outstanding extra charge for this booking.',
            ]);
        }

        $booking->load('car');

        return Inertia::render('payment', [
            'mode' => 'extra_charge',

            'payment_methods' => self::PAYMENT_METHODS,

            'booking' => [
                'id' => $booking->id,

                'total_price' => round(
                    (float) $booking->total_price,
                    2
                ),

                'extra_charge_amount' => round(
                    (float) $extraCharge->amount,
                    2
                ),

                'pickup_date' => $booking->pickup_date->toDateString(),

                'return_date' => $booking->return_date->toDateString(),

                'car' => $booking->car?->only([
                    'brand',
                    'model',
                    'plate_number',
                ]),

                'need_driver' => $booking->need_driver,

                'driver' => null,
            ],

            'role' => $user->role,
        ]);
    }

    /**
     * Store booking deposit payment.
     *
     * The payment is created and applied immediately.
     */
    public function store(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        if (
            $booking->status !==
            Booking::STATUS_CONFIRMED
        ) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking is not awaiting a deposit payment.',
            ]);
        }

        if ($this->customerIdentityNotApproved($user)) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Your national ID is awaiting admin approval. You can pay the deposit once your identity has been verified.',
            ]);
        }

        if ($booking->hasPaidDeposit()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking has already received a deposit payment.',
            ]);
        }

        $validated = $request->validate([
            'payment_method' => [
                'required',
                'string',
                'in:'.implode(',', self::PAYMENT_METHODS),
            ],

            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
                'required_unless:payment_method,Cash',
            ],
        ]);

        $depositAmount = round(
            $booking->depositAmount(),
            2
        );

        try {
            DB::transaction(function () use (
                $booking,
                $validated,
                $depositAmount
            ) {
                $lockedBooking = Booking::whereKey(
                    $booking->id
                )
                    ->lockForUpdate()
                    ->firstOrFail();

                if (
                    $lockedBooking->status !==
                    Booking::STATUS_CONFIRMED
                ) {
                    throw new \RuntimeException(
                        'status'
                    );
                }

                $existingPending = Payment::where(
                    'booking_id',
                    $lockedBooking->id
                )
                    ->where(
                        'type',
                        Payment::TYPE_DEPOSIT
                    )
                    ->where(
                        'payment_status',
                        'pending'
                    )
                    ->exists();

                if ($existingPending) {
                    throw new \RuntimeException(
                        'pending'
                    );
                }

                /*
                 * Create and immediately apply the deposit payment.
                 */
                $payment = Payment::create([
                    'booking_id' => $lockedBooking->id,

                    'type' => Payment::TYPE_DEPOSIT,

                    'amount' => $depositAmount,

                    'payment_method' => $validated['payment_method'],

                    'transaction_reference' => $validated['transaction_reference'] ?? null,

                    'payment_status' => 'pending',

                    'paid_at' => null,
                ]);

                $this->confirmPayment(
                    $payment,
                    now()
                );
            });
        } catch (\RuntimeException $e) {
            $message = match ($e->getMessage()) {
                'pending' => 'A deposit payment has already been submitted for this booking.',

                default => 'This booking is no longer available for deposit payment.',
            };

            return back()->with('toast', [
                'type' => 'error',
                'message' => $message,
            ]);
        }

        return redirect()
            ->route('bookings.index')
            ->with('toast', [
                'type' => 'success',
                'message' => 'Deposit paid successfully. Your booking is confirmed and the owner has been notified.',
            ]);
    }

    /**
     * Store pickup balance and security deposit.
     *
     * Both payments are created and applied immediately.
     */
    public function storePickup(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        if (
            $booking->status !==
            Booking::STATUS_DEPOSIT_PAID
        ) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking is not awaiting the pickup balance payment.',
            ]);
        }

        if ($booking->hasPaidBalance()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The balance has already been paid for this booking.',
            ]);
        }

        if (
            ! $booking->hasApprovedInspection(
                Inspection::TYPE_PICKUP
            )
        ) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'You can pay the balance once the vehicle passes the pickup inspection.',
            ]);
        }

        $paySecurityDeposit = $request->boolean(
            'security_deposit',
            true
        );

        $validated = $request->validate([
            'payment_method' => [
                'required',
                'string',
                'in:'.implode(',', self::PAYMENT_METHODS),
            ],

            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
                'required_unless:payment_method,Cash',
            ],
        ]);

        $balance = round(
            $booking->balanceAmount(),
            2
        );

        $securityDeposit = $paySecurityDeposit
            ? round(
                $booking->securityDepositAmount(),
                2
            )
            : 0.0;

        try {
            DB::transaction(function () use (
                $booking,
                $balance,
                $securityDeposit,
                $validated

            ) {
                $lockedBooking = Booking::whereKey(
                    $booking->id
                )
                    ->lockForUpdate()
                    ->firstOrFail();

                if (
                    $lockedBooking->status !==
                    Booking::STATUS_DEPOSIT_PAID
                ) {
                    throw new \RuntimeException(
                        'status'
                    );
                }

                if ($lockedBooking->hasPaidBalance()) {
                    throw new \RuntimeException(
                        'already-paid'
                    );
                }

                $existingPending = Payment::where(
                    'booking_id',
                    $lockedBooking->id
                )
                    ->whereIn('type', [
                        Payment::TYPE_BALANCE,
                        Payment::TYPE_SECURITY_DEPOSIT,
                    ])
                    ->where(
                        'payment_status',
                        'pending'
                    )
                    ->exists();

                if ($existingPending) {
                    throw new \RuntimeException(
                        'pending'
                    );
                }

                $createdPayments = collect();

                if ($balance > 0) {
                    $createdPayments->push(
                        Payment::create([
                            'booking_id' => $lockedBooking->id,
                            'type' => Payment::TYPE_BALANCE,
                            'amount' => $balance,
                            'payment_method' => $validated['payment_method'],
                            'transaction_reference' => $validated['transaction_reference'] ?? null,
                            'payment_status' => 'pending',
                            'paid_at' => null,
                        ])
                    );
                }

                if ($securityDeposit > 0) {
                    $createdPayments->push(
                        Payment::create([
                            'booking_id' => $lockedBooking->id,
                            'type' => Payment::TYPE_SECURITY_DEPOSIT,
                            'amount' => $securityDeposit,
                            'payment_method' => $validated['payment_method'],
                            'transaction_reference' => $validated['transaction_reference'] ?? null,
                            'payment_status' => 'pending',
                            'paid_at' => null,
                        ])
                    );
                }

                foreach ($createdPayments as $payment) {
                    $this->confirmPayment(
                        $payment,
                        now()
                    );
                }
            });
        } catch (\RuntimeException $e) {
            $message = match ($e->getMessage()) {
                'pending' => 'A pickup payment has already been submitted for this booking.',
                'already-paid' => 'The balance has already been paid for this booking.',
                default => 'This booking is no longer available for pickup payment.',
            };

            return back()->with('toast', [
                'type' => 'error',
                'message' => $message,
            ]);
        }

        return redirect()
            ->route('bookings.index')
            ->with('toast', [
                'type' => 'success',
                'message' => 'Payment received successfully. Your booking is fully paid.',
            ]);
    }

    /**
     * Store an extra charge payment.
     *
     * The payment is created and applied immediately.
     */
    public function storeExtraCharge(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        $validated = $request->validate([
            'payment_method' => [
                'required',
                'string',
                'in:'.implode(',', self::PAYMENT_METHODS),
            ],

            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
                'required_unless:payment_method,Cash',
            ],
        ]);

        try {
            DB::transaction(function () use (
                $booking,
                $validated
            ) {
                $extraCharge = $booking->payments()
                    ->where(
                        'type',
                        Payment::TYPE_EXTRA_CHARGE
                    )
                    ->where(
                        'payment_status',
                        'pending'
                    )
                    ->lockForUpdate()
                    ->latest()
                    ->first();

                if (! $extraCharge) {
                    throw new \RuntimeException(
                        'no-extra-charge'
                    );
                }

                $extraCharge->update([
                    'payment_method' => $validated['payment_method'],

                    'transaction_reference' => $validated['transaction_reference'] ?? null,

                    'payment_status' => 'pending',

                    'paid_at' => null,
                ]);

                /*
                 * Apply the extra charge payment immediately.
                 */
                $this->confirmPayment(
                    $extraCharge,
                    now()
                );
            });
        } catch (\RuntimeException $e) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This extra charge has already been submitted or no longer exists.',
            ]);
        }

        return redirect()
            ->route('payments.index')
            ->with('toast', [
                'type' => 'success',
                'message' => 'Extra charge paid successfully.',
            ]);
    }

    /**
     * Confirm a pending payment.
     *
     * This endpoint is retained for administrative payment
     * confirmation if needed. Customer-submitted payments
     * are currently applied immediately.
     */
    public function confirm(
        Payment $payment
    ): RedirectResponse {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            abort(403);
        }

        try {
            DB::transaction(function () use ($payment) {
                $lockedPayment = Payment::whereKey(
                    $payment->id
                )
                    ->lockForUpdate()
                    ->firstOrFail();

                if (
                    $lockedPayment->payment_status !==
                    'pending'
                ) {
                    throw new \RuntimeException(
                        'already-confirmed'
                    );
                }

                /*
                 * Only the currently supported payment methods
                 * can be confirmed.
                 */
                if (
                    ! in_array(
                        $lockedPayment->payment_method,
                        self::PAYMENT_METHODS,
                        true
                    )
                ) {
                    throw new \RuntimeException(
                        'invalid-method'
                    );
                }

                $this->confirmPayment(
                    $lockedPayment,
                    now()
                );
            });
        } catch (\RuntimeException $e) {
            $message = match ($e->getMessage()) {
                'already-confirmed' => 'This payment has already been confirmed.',

                'invalid-method' => 'This payment method is not supported by the system.',

                'invalid-booking-status' => 'This booking is no longer in the correct payment stage.',

                default => 'This payment could not be confirmed.',
            };

            return back()->with('toast', [
                'type' => 'error',
                'message' => $message,
            ]);
        }

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Payment confirmed successfully.',
        ]);
    }

    /**
     * Apply a payment to its booking.
     *
     * Marks the payment as paid, performs the appropriate
     * booking status transition, updates the vehicle when
     * necessary, and sends the related notifications.
     */
    private function confirmPayment(
        Payment $payment,
        CarbonInterface $now
    ): void {
        $booking = Booking::whereKey(
            $payment->booking_id
        )
            ->lockForUpdate()
            ->firstOrFail();

        /*
         * ------------------------------------------------------
         * BOOKING DEPOSIT
         * ------------------------------------------------------
         */
        if (
            $payment->type ===
            Payment::TYPE_DEPOSIT
        ) {
            if (
                $booking->status !==
                Booking::STATUS_CONFIRMED
            ) {
                throw new \RuntimeException(
                    'invalid-booking-status'
                );
            }

            $payment->update([
                'payment_status' => 'paid',

                'paid_at' => $now,
            ]);

            $booking->update([
                'status' => Booking::STATUS_DEPOSIT_PAID,

                'deposit_paid_at' => $now,
            ]);

            $this->notifyDepositPaid(
                $booking,
                (float) $payment->amount
            );

            // Trigger driver assignment if inspection is already approved
            $this->driverMatching->triggerDriverAssignmentIfReady($booking);

            return;
        }

        /*
         * ------------------------------------------------------
         * SECURITY DEPOSIT — just mark the single payment as paid
         * ------------------------------------------------------
         */
        if ($payment->type === Payment::TYPE_SECURITY_DEPOSIT) {
            $payment->update([
                'payment_status' => 'paid',
                'paid_at' => $now,
            ]);

            if (! $booking->security_deposit_paid_at) {
                $booking->update([
                    'security_deposit_paid_at' => $now,
                ]);
            }

            return;
        }

        /*
         * ------------------------------------------------------
         * PICKUP BALANCE
         * ------------------------------------------------------
         */
        if ($payment->type === Payment::TYPE_BALANCE) {
            if (
                $booking->status !==
                Booking::STATUS_DEPOSIT_PAID
            ) {
                throw new \RuntimeException(
                    'invalid-booking-status'
                );
            }

            $pickupPayments = Payment::where(
                'booking_id',
                $booking->id
            )
                ->where(
                    'type',
                    Payment::TYPE_BALANCE
                )
                ->where(
                    'payment_status',
                    'pending'
                )
                ->lockForUpdate()
                ->get();

            if ($pickupPayments->isEmpty()) {
                throw new \RuntimeException(
                    'already-confirmed'
                );
            }

            foreach (
                $pickupPayments as $pickupPayment
            ) {
                $pickupPayment->update([
                    'payment_status' => 'paid',

                    'paid_at' => $now,
                ]);
            }

            $balancePaid =
                $booking->balanceAmount() <= 0
                ||
                Payment::where(
                    'booking_id',
                    $booking->id
                )
                    ->where(
                        'type',
                        Payment::TYPE_BALANCE
                    )
                    ->where(
                        'payment_status',
                        'paid'
                    )
                    ->exists();

            if (
                $balancePaid
            ) {
                $balance =
                    $booking->balanceAmount();

                $securityDeposit =
                    $booking->securityDepositAmount();

                $hasSecurityDepositPayment = Payment::where(
                    'booking_id',
                    $booking->id
                )
                    ->where(
                        'type',
                        Payment::TYPE_SECURITY_DEPOSIT
                    )
                    ->where(
                        'payment_status',
                        'paid'
                    )
                    ->exists();

                $booking->update([
                    'status' => Booking::STATUS_PAID,

                    'balance_paid_at' => $now,

                    'security_deposit_paid_at' => $hasSecurityDepositPayment ? $now : $booking->security_deposit_paid_at,
                ]);

                $booking->loadMissing('car');

                if ($booking->car) {
                    $booking->car->update([
                        'availability_status' => 'booked',
                    ]);
                }

                $this->notifyBookingFullyPaid(
                    $booking,
                    $balance,
                    $hasSecurityDepositPayment ? $securityDeposit : 0.0
                );
            }

            return;
        }

        /*
         * ------------------------------------------------------
         * EXTRA CHARGE
         * ------------------------------------------------------
         */
        if (
            $payment->type ===
            Payment::TYPE_EXTRA_CHARGE
        ) {
            $payment->update([
                'payment_status' => 'paid',

                'paid_at' => $now,
            ]);

            $pendingExtraCharges = $booking->payments()
                ->where(
                    'type',
                    Payment::TYPE_EXTRA_CHARGE
                )
                ->where(
                    'payment_status',
                    'pending'
                )
                ->exists();

            if (
                $booking->hasLeverageDocument() &&
                $booking->leverage_document_status === 'pending_charges' &&
                ! $pendingExtraCharges
            ) {
                $booking->releaseLeverageDocument();

                $booking->loadMissing(
                    'customer',
                    'car'
                );

                $booking->customer?->notifyNow(
                    "Leverage document released - Booking #{$booking->id}",
                    sprintf(
                        'Your leverage document for the %s %s has been released after settling all outstanding charges.',
                        $booking->car?->brand,
                        $booking->car?->model,
                    ),
                    'leverage_document_released',
                    Booking::class,
                    $booking->id,
                );
            }

            $booking->loadMissing(
                'owner',
                'car'
            );

            $booking->owner?->notifyNow(
                "Extra charge settled - Booking #{$booking->id}",
                sprintf(
                    'The customer paid the outstanding repair/late fee balance for your %s %s.',
                    $booking->car?->brand,
                    $booking->car?->model,
                ),
                'extra_charge_paid',
                Booking::class,
                $booking->id,
            );

            return;
        }

        throw new \RuntimeException(
            'unsupported-type'
        );
    }

    /**
     * Payment receipt.
     */
    public function receipt(
        Payment $payment
    ): Response {
        $user = auth()->user();

        $payment->load([
            'booking.customer',
            'booking.owner',
            'booking.car',
            'booking.payments',
            'booking.refunds',
        ]);

        $booking = $payment->booking;

        if (
            $booking->customer_id !== $user->id &&
            $booking->owner_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        $days = max(
            1,
            $booking->pickup_date->diffInDays(
                $booking->return_date
            )
        );

        $dailyRate = (float) (
            $booking->car?->daily_price ?? 0.0
        );

        $rentalSubtotal = round(
            $dailyRate * $days,
            2
        );

        $totalPrice = round(
            (float) $booking->total_price,
            2
        );

        $driverFee = round(
            (float) ($booking->driver_fee ?? 0.0),
            2
        );

        $paidToDate = $booking->payments
            ->where(
                'payment_status',
                'paid'
            )
            ->where(
                'type',
                '!=',
                Payment::TYPE_SECURITY_DEPOSIT
            )
            ->sum(
                fn (Payment $paidPayment) => (float) $paidPayment->amount
            );

        $balanceRemaining = round(
            max(
                0.0,
                $totalPrice - $paidToDate
            ),
            2
        );

        return Inertia::render('receipt', [
            'payment' => [
                'id' => $payment->id,

                'type' => $payment->type,

                'type_label' => match (
                    $payment->type
                ) {
                    Payment::TYPE_DEPOSIT => 'Booking Deposit',

                    Payment::TYPE_BALANCE => 'Balance Payment',

                    Payment::TYPE_SECURITY_DEPOSIT => 'Security Deposit',

                    Payment::TYPE_EXTRA_CHARGE => 'Extra Charge',

                    default => 'Payment',
                },

                'amount' => $payment->amount,

                'payment_method' => $payment->payment_method,

                'transaction_reference' => $payment->transaction_reference,

                'payment_status' => $payment->payment_status,

                'paid_at' => $payment->paid_at?->toDateTimeString(),
            ],

            'booking' => [
                'id' => $booking->id,

                'pickup_date' => $booking->pickup_date->toDateString(),

                'return_date' => $booking->return_date->toDateString(),

                'pickup_location' => $booking->pickup_location,

                'return_location' => $booking->return_location,

                'need_driver' => $booking->need_driver,

                'total_price' => number_format(
                    $totalPrice,
                    2
                ),

                'days' => $days,

                'daily_rate' => number_format(
                    $dailyRate,
                    2
                ),

                'subtotal' => number_format(
                    $rentalSubtotal,
                    2
                ),

                'driver_fee' => number_format(
                    $driverFee,
                    2
                ),

                'deposit_amount' => number_format(
                    $booking->depositAmount(),
                    2
                ),

                'full_deposit' => number_format(
                    $totalPrice,
                    2
                ),

                'full_deposit_balance' => number_format(
                    $booking->balanceAmount(),
                    2
                ),

                'security_deposit' => number_format(
                    $booking->securityDepositAmount(),
                    2
                ),

                'paid_to_date' => number_format(
                    $paidToDate,
                    2
                ),

                'balance_remaining' => number_format(
                    $balanceRemaining,
                    2
                ),
            ],

            'customer' => $booking->customer
                ? [
                    'name' => $booking->customer->name,

                    'email' => $booking->customer->email,

                    'phone' => $booking->customer->phone,
                ]
                : null,

            'car' => $booking->car
                ? [
                    'brand' => $booking->car->brand,

                    'model' => $booking->car->model,

                    'plate_number' => $booking->car->plate_number,
                ]
                : null,

            'refunds' => $booking->refunds
                ->map(
                    fn (
                        Refund $refund
                    ) => [
                        'id' => $refund->id,

                        'amount' => number_format(
                            (float) $refund->amount,
                            2
                        ),

                        'reason' => $refund->reason,

                        'status' => $refund->status,

                        'processed_at' => $refund->processed_at
                            ?->toDateTimeString(),
                    ]
                )
                ->values(),
        ]);
    }

    /**
     * Download the payment receipt as a PDF.
     */
    public function download(Payment $payment): HttpResponse
    {
        $user = auth()->user();

        $payment->load([
            'booking.customer',
            'booking.owner',
            'booking.car',
            'booking.payments',
            'booking.refunds',
        ]);

        $booking = $payment->booking;

        if (
            $booking->customer_id !== $user->id &&
            $booking->owner_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        $days = max(1, $booking->pickup_date->diffInDays($booking->return_date));
        $dailyRate = (float) ($booking->car?->daily_price ?? 0.0);
        $rentalSubtotal = round($dailyRate * $days, 2);
        $totalPrice = round((float) $booking->total_price, 2);
        $driverFee = round((float) ($booking->driver_fee ?? 0.0), 2);

        $paidToDate = $booking->payments
            ->where('payment_status', 'paid')
            ->where('type', '!=', Payment::TYPE_SECURITY_DEPOSIT)
            ->sum(fn (Payment $p) => (float) $p->amount);

        $balanceRemaining = round(max(0.0, $totalPrice - $paidToDate), 2);

        $data = [
            'companyName' => config('app.name', 'Car Rental'),

            'payment' => [
                'id' => $payment->id,
                'type' => $payment->type,
                'type_label' => match ($payment->type) {
                    Payment::TYPE_DEPOSIT => 'Booking Deposit',
                    Payment::TYPE_BALANCE => 'Balance Payment',
                    Payment::TYPE_SECURITY_DEPOSIT => 'Security Deposit',
                    Payment::TYPE_EXTRA_CHARGE => 'Extra Charge',
                    default => 'Payment',
                },
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'transaction_reference' => $payment->transaction_reference,
                'payment_status' => $payment->payment_status,
                'paid_at' => $payment->paid_at?->toDateTimeString(),
            ],

            'booking' => [
                'id' => $booking->id,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'need_driver' => $booking->need_driver,
                'total_price' => number_format($totalPrice, 2),
                'days' => $days,
                'daily_rate' => number_format($dailyRate, 2),
                'subtotal' => number_format($rentalSubtotal, 2),
                'driver_fee' => number_format($driverFee, 2),
                'deposit_amount' => number_format($booking->depositAmount(), 2),
                'full_deposit' => number_format($totalPrice, 2),
                'full_deposit_balance' => number_format($booking->balanceAmount(), 2),
                'security_deposit' => number_format($booking->securityDepositAmount(), 2),
                'paid_to_date' => number_format($paidToDate, 2),
                'balance_remaining' => number_format($balanceRemaining, 2),
            ],

            'customer' => $booking->customer ? [
                'name' => $booking->customer->name,
                'email' => $booking->customer->email,
                'phone' => $booking->customer->phone,
            ] : null,

            'car' => $booking->car ? [
                'brand' => $booking->car->brand,
                'model' => $booking->car->model,
                'plate_number' => $booking->car->plate_number,
            ] : null,

            'refunds' => $booking->refunds
                ->map(fn (Refund $refund) => [
                    'id' => $refund->id,
                    'amount' => number_format((float) $refund->amount, 2),
                    'reason' => $refund->reason,
                    'status' => $refund->status,
                    'processed_at' => $refund->processed_at?->toDateTimeString(),
                ])
                ->values()
                ->all(),
        ];

        $pdf = Pdf::loadView('receipts.pdf', $data)->setPaper('a4', 'portrait');

        return $pdf->download("receipt-{$payment->id}.pdf");
    }

    /**
     * Determine whether the customer's identity is approved.
     */
    private function customerIdentityNotApproved(
        User $user
    ): bool {
        if ($user->role === 'admin') {
            return false;
        }

        $identity = $user->customerIdentity;

        return $identity !== null &&
            ! $identity->isApproved();
    }

    /**
     * Notify the owner after a confirmed deposit.
     */
    private function notifyDepositPaid(
        Booking $booking,
        float $depositAmount
    ): void {
        $booking->loadMissing(
            'owner',
            'car'
        );

        $owner = $booking->owner;
        $car = $booking->car;

        if (! $owner || ! $car) {
            return;
        }

        $owner->notifyNow(
            "Bring your {$car->brand} {$car->model} to the branch",
            sprintf(
                'A customer paid the ETB %s booking deposit for your %s %s. Please deliver the car to %s by %s so the pre-rental inspection can take place before pickup on %s.',
                number_format(
                    $depositAmount,
                    2
                ),

                $car->brand,

                $car->model,

                $booking->pickup_location,

                $booking
                    ->carDeliveryDueDate()
                    ->format('M j, Y'),

                $booking
                    ->pickup_date
                    ->format('M j, Y g:i A'),
            ),
            'booking_locked',
            Booking::class,
            $booking->id,
        );
    }

    /**
     * Notify customer and owner after full payment.
     */
    private function notifyBookingFullyPaid(
        Booking $booking,
        float $balance,
        float $securityDeposit
    ): void {
        $booking->loadMissing(
            'customer',
            'owner',
            'car'
        );

        if (
            $booking->customer &&
            $booking->car
        ) {
            if ($securityDeposit > 0) {
                $totalReceived = round(
                    $balance + $securityDeposit,
                    2
                );

                $booking->customer->notifyNow(
                    "Booking #{$booking->id} fully paid",
                    sprintf(
                        'Your payment of ETB %s (ETB %s rental balance + ETB %s security deposit) was received for the %s %s. The vehicle is ready for pickup at %s on %s.',
                        number_format(
                            $totalReceived,
                            2
                        ),
                        number_format(
                            $balance,
                            2
                        ),
                        number_format(
                            $securityDeposit,
                            2
                        ),
                        $booking->car->brand,
                        $booking->car->model,
                        $booking->pickup_location,
                        $booking
                            ->pickup_date
                            ->format(
                                'M j, Y g:i A'
                            ),
                    ),
                    'booking_paid',
                    Booking::class,
                    $booking->id,
                );
            } else {
                $booking->customer->notifyNow(
                    "Booking #{$booking->id} fully paid",
                    sprintf(
                        'Your payment of ETB %s (rental balance) was received for the %s %s. A leverage document will be collected during handover. The vehicle is ready for pickup at %s on %s.',
                        number_format(
                            $balance,
                            2
                        ),
                        $booking->car->brand,
                        $booking->car->model,
                        $booking->pickup_location,
                        $booking
                            ->pickup_date
                            ->format(
                                'M j, Y g:i A'
                            ),
                    ),
                    'booking_paid',
                    Booking::class,
                    $booking->id,
                );
            }
        }

        if (
            $booking->owner &&
            $booking->car
        ) {
            if ($securityDeposit > 0) {
                $totalReceived = round(
                    $balance + $securityDeposit,
                    2
                );

                $booking->owner->notifyNow(
                    "Booking #{$booking->id} fully paid",
                    sprintf(
                        'The customer paid ETB %s (ETB %s rental balance + ETB %s security deposit) for your %s %s. Prepare for handover at %s on %s.',
                        number_format(
                            $totalReceived,
                            2
                        ),
                        number_format(
                            $balance,
                            2
                        ),
                        number_format(
                            $securityDeposit,
                            2
                        ),
                        $booking->car->brand,
                        $booking->car->model,
                        $booking->pickup_location,
                        $booking
                            ->pickup_date
                            ->format(
                                'M j, Y g:i A'
                            ),
                    ),
                    'booking_paid',
                    Booking::class,
                    $booking->id,
                );
            } else {
                $booking->owner->notifyNow(
                    "Booking #{$booking->id} fully paid",
                    sprintf(
                        'The customer paid ETB %s (rental balance) for your %s %s. A leverage document will be collected during handover. Prepare for handover at %s on %s.',
                        number_format(
                            $balance,
                            2
                        ),
                        $booking->car->brand,
                        $booking->car->model,
                        $booking->pickup_location,
                        $booking
                            ->pickup_date
                            ->format(
                                'M j, Y g:i A'
                            ),
                    ),
                    'booking_paid',
                    Booking::class,
                    $booking->id,
                );
            }
        }
    }
}
