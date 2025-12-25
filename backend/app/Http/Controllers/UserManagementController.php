<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ResponseService;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:user.manage');
    }

    public function index(Request $request)
    {
        try {
            $query = User::with(['roles', 'permissions']);

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->paginate(15);

            return ResponseService::success(UserResource::collection($users)->response()->getData(true));
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch users: ' . $e->getMessage(), null, 500);
        }
    }

    public function show($id)
    {
        try {
            $user = User::with(['roles', 'permissions'])->findOrFail($id);
            return ResponseService::success(new UserResource($user));
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch user: ' . $e->getMessage(), null, 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role_id' => 'nullable|integer|exists:roles,id'
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Assign role if provided
            if ($request->has('role_id') && $request->role_id) {
                $role = Role::find($request->role_id);
                if ($role) {
                    $user->assignRole($role->name);
                }
            }

            return ResponseService::success(
                new UserResource($user->load(['roles', 'permissions'])),
                'User created successfully',
                201
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to create user: ' . $e->getMessage(), null, 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
                'password' => 'sometimes|nullable|string|min:8',
                'role_id' => 'sometimes|nullable|integer|exists:roles,id'
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            if ($request->has('name')) {
                $user->name = $request->name;
            }

            if ($request->has('email')) {
                $user->email = $request->email;
            }

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            // Update role if provided
            if ($request->has('role_id') && $request->role_id) {
                $role = Role::find($request->role_id);
                if ($role) {
                    $user->syncRoles([$role->name]);
                }
            }

            return ResponseService::success(
                $user->load(['roles', 'permissions']),
                'User updated successfully'
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to update user: ' . $e->getMessage(), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Prevent deleting self
            if ($user->id === auth()->id()) {
                return ResponseService::error('Cannot delete yourself', null, 400);
            }

            // Prevent deleting last Super Admin
            if ($user->hasRole('Super Admin')) {
                $superAdminCount = User::role('Super Admin')->count();
                if ($superAdminCount <= 1) {
                    return ResponseService::error('Cannot delete the last Super Admin', null, 400);
                }
            }

            $user->delete();

            return ResponseService::success(null, 'User deleted successfully');
        } catch (\Exception $e) {
            return ResponseService::error('Failed to delete user: ' . $e->getMessage(), null, 500);
        }
    }

    public function assignRole(Request $request, $id)
    {
        try {
            $request->validate([
                'role_id' => 'required|integer|exists:roles,id'
            ]);

            $user = User::findOrFail($id);
            $role = Role::findOrFail($request->role_id);
            $user->syncRoles([$role->name]);

            return ResponseService::success(
                $user->load(['roles', 'permissions']),
                'Role assigned successfully'
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to assign role: ' . $e->getMessage(), null, 500);
        }
    }

    public function assignPermissions(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Permissions assigned successfully',
            'user' => $user->load(['roles', 'permissions'])
        ]);
    }
}
