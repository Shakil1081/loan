<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\RoleManagementController;
use App\Http\Controllers\PermissionManagementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Profile management
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
    
    // Loan routes
    Route::post('/loans/apply', [LoanController::class, 'apply']);
    Route::get('/loans', [LoanController::class, 'myLoans']);
    Route::get('/loans/{id}', [LoanController::class, 'show']);
    
    // Admin routes
    Route::prefix('admin')->group(function () {
        // Loan management
        Route::get('/loans', [LoanController::class, 'index']);
        Route::patch('/loans/{id}/status', [LoanController::class, 'updateStatus']);
        
        // User management
        Route::apiResource('users', UserManagementController::class);
        Route::post('/users/{id}/assign-role', [UserManagementController::class, 'assignRole']);
        Route::post('/users/{id}/assign-permissions', [UserManagementController::class, 'assignPermissions']);
        
        // Role management
        Route::apiResource('roles', RoleManagementController::class);
        Route::post('/roles/{id}/assign-permissions', [RoleManagementController::class, 'assignPermissions']);
        
        // Permission management
        Route::apiResource('permissions', PermissionManagementController::class);
        Route::get('/permissions-grouped', [PermissionManagementController::class, 'getGrouped']);
    });
});
