<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use OpenApi\Annotations\OA;

/**
 * @OA\Info(
 *     title="KernelLearn API",
 *     version="1.0.0",
 *     description="API del proyecto KernelLearn - Sprint 1"
 * )
 * 
 * @OA\Server(
 *     url="http://100.107.236.28/api/v1",
 *     description="KernelLearn Production Server"
 * )
 */
abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;
}
