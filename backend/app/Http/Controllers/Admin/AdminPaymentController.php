<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    /**
     * Listar todas las transacciones de pago (Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with('user', 'subscription.plan');

        // Filtro por estado
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        // Filtro por método de pago
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->query('payment_method'));
        }

        // Filtro por fecha
        if ($request->has('date_from')) {
            $query->whereDate('payment_date', '>=', $request->query('date_from'));
        }
        if ($request->has('date_to')) {
            $query->whereDate('payment_date', '<=', $request->query('date_to'));
        }

        // Búsqueda por usuario o email
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->query('per_page', 20);
        $payments = $query->latest('payment_date')->paginate($perPage);

        // Estadísticas basadas en los filtros actuales (clon del query antes de paginar)
        $statsQuery = clone $query;
        $total = (clone $statsQuery)->where('status', 'completed')->sum('amount');
        $count = (clone $statsQuery)->where('status', 'completed')->count();

        return response()->json([
            'success' => true,
            'message' => 'Transacciones obtenidas',
            'data' => [
                'payments' => $payments->items(),
            ],
            'meta' => [
                'total' => $payments->total(),
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total_revenue' => $total,
                'total_transactions' => $count,
            ]
        ]);
    }

    /**
     * Obtener estadísticas de pagos
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'total_transactions' => Payment::where('status', 'completed')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
            'payment_methods' => Payment::where('status', 'completed')
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_method')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
