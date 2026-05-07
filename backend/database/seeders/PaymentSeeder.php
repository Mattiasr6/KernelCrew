<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CreditPackage;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role_id', 3)->get()->keyBy('email');
        $packages = CreditPackage::all()->keyBy('name');

        if ($packages->isEmpty()) {
            $this->command->warn('No hay paquetes de créditos. Ejecuta CreditPackageSeeder primero.');
            return;
        }

        // Payment data: email, package name, days ago
        $payments = [
            ['email' => 'mattias@kernellearn.com',        'package' => 'Starter', 'days' => 120],
            ['email' => 'mattias@kernellearn.com',        'package' => 'Pro',     'days' => 30],
            ['email' => 'ana@kernellearn.com',             'package' => 'Starter', 'days' => 90],
            ['email' => 'maria@kernellearn.com',           'package' => 'Pro',     'days' => 65],
            ['email' => 'jorge@kernellearn.com',           'package' => 'Master',  'days' => 21],
            ['email' => 'diego@kernellearn.com',           'package' => 'Starter', 'days' => 150],
            ['email' => 'roberto.aguirre@kernellearn.com', 'package' => 'Pro',     'days' => 28],
        ];

        $totalCount = 0;
        $totalRevenue = 0;

        foreach ($payments as $data) {
            $student = $students->get($data['email']);
            $pkg = $packages->get($data['package']);
            if (!$student || !$pkg) continue;

            $paymentDate = Carbon::now()->subDays($data['days']);
            $transactionId = 'txn_' . strtoupper(bin2hex(random_bytes(12)));

            Payment::create([
                'user_id' => $student->id,
                'credit_package_id' => $pkg->id,
                'amount' => $pkg->price_usd,
                'payment_date' => $paymentDate,
                'transaction_id' => $transactionId,
                'payment_method' => 'stripe',
                'status' => 'completed',
                'payment_gateway_response' => [
                    'id' => $transactionId,
                    'card_last4' => '4242',
                    'card_brand' => 'visa',
                    'captured' => true,
                ],
            ]);

            // Update user's credits balance
            $student->increment('credits_balance', $pkg->credits_amount);

            $totalCount++;
            $totalRevenue += $pkg->price_usd;
        }

        $this->command->info("Pagos de créditos: {$totalCount} transacciones, \$" . number_format($totalRevenue, 2) . " USD.");
    }
}
