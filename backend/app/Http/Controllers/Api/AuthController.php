<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'in:Applicant,Super Admin'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign role (default to Applicant if not specified)
        $role = $request->input('role', 'Applicant');
        $user->assignRole($role);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load roles with permissions and direct permissions
        $user->load('roles.permissions', 'permissions');
        
        // Get all permissions (direct + from roles)
        $allPermissions = $user->getAllPermissions();
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => array_merge($user->toArray(), [
                'all_permissions' => $allPermissions->map(fn($p) => $p->name)->unique()->values()->toArray()
            ]),
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load roles with permissions and direct permissions
        $user->load('roles.permissions', 'permissions');
        
        // Get all permissions (direct + from roles)
        $allPermissions = $user->getAllPermissions();
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => array_merge($user->toArray(), [
                'all_permissions' => $allPermissions->map(fn($p) => $p->name)->unique()->values()->toArray()
            ]),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get authenticated user details
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('roles.permissions', 'permissions');
        
        // Get all permissions (direct + from roles)
        $allPermissions = $user->getAllPermissions();
        
        return response()->json(array_merge($user->toArray(), [
            'all_permissions' => $allPermissions->map(fn($p) => $p->name)->unique()->values()->toArray()
        ]));
    }
}
