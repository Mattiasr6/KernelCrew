<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Activity;
use App\Models\Payment;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final readonly class SubscriptionService
{
    public function activate(
        User $user,
        SubscriptionPlan $plan,
        string $paymentMethod,
        float $amount,
        string $transactionId,
        bool $registerActivity = true,
    ): UserSubscription {
        return DB::transaction(function () use ($user, $plan, $paymentMethod, $amount, $transactionId, $registerActivity) {
            $user->subscriptions()->where('status', 'active')->update(['status' => 'expired']);

            $subscription = UserSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'auto_renew' => true,
            ]);

            Payment::create([
                'user_id' => $user->id,
                'user_subscription_id' => $subscription->id,
                'amount' => $amount,
                'payment_date' => now(),
                'transaction_id' => $transactionId,
                'status' => 'completed',
                'payment_method' => $paymentMethod,
            ]);

            if ($registerActivity) {
                Activity::create([
                    'user_id' => $user->id,
                    'type' => 'subscription_activated',
                    'description' => "Te has suscrito al plan {$plan->name} exitosamente.",
                ]);
            }

            Log::info("Suscripción activada para usuario {$user->email}, plan {$plan->name}, método {$paymentMethod}");

            return $subscription;
        });
    }
}
