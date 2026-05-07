<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function myPayments(Request $request): JsonResponse
    {
        $user = $request->user();

        $payments = Payment::with('creditPackage')
            ->where('user_id', $user->id)
            ->latest('payment_date')
            ->take(20)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'date' => $payment->payment_date,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'package_name' => $payment->creditPackage?->name ?? 'N/A',
                    'credits_amount' => $payment->creditPackage?->credits_amount ?? 0,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }
}
