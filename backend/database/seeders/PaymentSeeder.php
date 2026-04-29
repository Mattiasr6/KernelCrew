<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserSubscription;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role_id', 3)->get();
        $subscriptions = UserSubscription::with('plan')->get();

        $paymentCount = 0;
        $totalRevenue = 0;
        $recentWeeks = 3;
        $paymentMethods = ['stripe', 'paypal', 'manual'];
        
        foreach ($subscriptions as $subscription) {
            $plan = $subscription->plan;
            if (!$plan) continue;

            $createdAt = $subscription->start_date;
            $subscriptionMonths = $subscription->start_date->diffInMonths(Carbon::now());
            $renewalCount = min($subscriptionMonths, 3);

            for ($i = 0; $i <= $renewalCount; $i++) {
                $paymentDate = $subscription->start_date->copy()->addMonths($i);
                
                if ($paymentDate->isAfter(Carbon::now()->subWeeks($recentWeeks))) {
                    $paymentDate = Carbon::now()->subDays(rand(1, 20))->subHours(rand(0, 23));
                }

                $transactionId = 'txn_' . strtoupper(bin2hex(random_bytes(12)));

                Payment::create([
                    'user_id' => $subscription->user_id,
                    'user_subscription_id' => $subscription->id,
                    'amount' => $plan->price,
                    'payment_date' => $paymentDate,
                    'transaction_id' => $transactionId,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'status' => 'completed',
                    'payment_gateway_response' => [
                        'id' => $transactionId,
                        'card_last4' => '4242',
                        'card_brand' => 'visa',
                        'captured' => true,
                    ],
                ]);

                $paymentCount++;
                $totalRevenue += $plan->price;
            }
        }

        // Pagos recientes adicionales
        $recentPayments = [
            ['email' => 'mattias@kernellearn.com', 'days_ago' => 2, 'amount' => 9999],
            ['email' => 'ana@kernellearn.com', 'days_ago' => 5, 'amount' => 5999],
            ['email' => 'maria@kernellearn.com', 'days_ago' => 8, 'amount' => 2999],
            ['email' => 'diego@kernellearn.com', 'days_ago' => 10, 'amount' => 4499],
            ['email' => 'sofia@kernellearn.com', 'days_ago' => 12, 'amount' => 5999],
            ['email' => 'jorge@kernellearn.com', 'days_ago' => 15, 'amount' => 5499],
            ['email' => 'valentina@kernellearn.com', 'days_ago' => 18, 'amount' => 2999],
            ['email' => 'fernando@kernellearn.com', 'days_ago' => 19, 'amount' => 3499],
        ];

        foreach ($recentPayments as $data) {
            $student = $students->where('email', $data['email'])->first();
            if (!$student) continue;

            $subscription = UserSubscription::where('user_id', $student->id)
                ->where('status', 'active')
                ->first();

            $transactionId = 'txn_' . strtoupper(bin2hex(random_bytes(12)));

            Payment::create([
                'user_id' => $student->id,
                'user_subscription_id' => $subscription?->id ?? 1,
                'amount' => $data['amount'],
                'payment_date' => Carbon::now()->subDays($data['days_ago']),
                'transaction_id' => $transactionId,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'status' => 'completed',
                'payment_gateway_response' => [
                    'id' => $transactionId,
                    'card_last4' => rand(1000, 9999),
                    'card_brand' => ['visa', 'mastercard', 'amex'][rand(0, 2)],
                    'captured' => true,
                ],
            ]);

            $paymentCount++;
            $totalRevenue += $data['amount'];
        }

        $totalRevenueBs = number_format($totalRevenue / 100, 2);

        $this->command->info("Transacciones creadas:");
        $this->command->info("- Total transacciones: {$paymentCount}");
        $this->command->info("- Ingresos totales: Bs {$totalRevenueBs}");
        $this->command->info("- Pico de actividad en últimas 3 semanas");
    }
}