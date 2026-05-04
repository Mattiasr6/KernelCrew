<?php

namespace App\Http\Controllers;

use App\Models\CreditPackage;
use Illuminate\Http\JsonResponse;

class CreditPackageController extends Controller
{
    public function index(): JsonResponse
    {
        $packages = CreditPackage::where('is_active', true)
            ->orderBy('price_usd')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
        ]);
    }
}
