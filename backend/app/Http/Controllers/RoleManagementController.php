<?php

namespace App\Http\Controllers;

use App\Services\ResponseService;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:role.manage');
    }

    public function index(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $page = $request->get('page', 1);
            $cacheKey = "roles_page_{$page}_search_" . md5($search);

            $roles = Cache::remember($cacheKey, 300, function () use ($search) {
                $query = Role::with('permissions');

                if ($search) {
                    $query->where('name', 'like', "%{$search}%");
                }

                return $query->paginate(15);
            });

            return ResponseService::success(RoleResource::collection($roles)->response()->getData(true));
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch roles: ' . $e->getMessage(), null, 500);
        }
    }

    public function show($id)
    {
        try {
            $role = Role::with('permissions')->findOrFail($id);
            return ResponseService::success(new RoleResource($role));
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch role: ' . $e->getMessage(), null, 500);
        }
    }

    public function store(StoreRoleRequest $request)
    {
        try {
            $role = Role::create(['name' => $request->name]);

            // Clear roles cache
            Cache::tags(['roles'])->flush();

            return ResponseService::success(
                new RoleResource($role->load('permissions')),
                'Role created successfully',
                201
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to create role: ' . $e->getMessage(), null, 500);
        }
    }

    public function update(UpdateRoleRequest $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent editing Super Admin role
            if ($role->name === 'Super Admin') {
                return ResponseService::error('Cannot edit Super Admin role', null, 403);
            }

            if ($request->has('name')) {
                $role->name = $request->name;
                $role->save();
            }

            // Clear roles cache
            Cache::tags(['roles'])->flush();

            return ResponseService::success(
                new RoleResource($role->load('permissions')),
                'Role updated successfully'
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to update role: ' . $e->getMessage(), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent deleting Super Admin or Applicant roles
            if (in_array($role->name, ['Super Admin', 'Applicant'])) {
                return ResponseService::error('Cannot delete system roles', null, 403);
            }

            // Check if role is assigned to any users
            if ($role->users()->count() > 0) {
                return ResponseService::error('Cannot delete role that is assigned to users', null, 400);
            }

            $role->delete();

            // Clear roles cache
            Cache::tags(['roles'])->flush();

            return ResponseService::success(null, 'Role deleted successfully');
        } catch (\Exception $e) {
            return ResponseService::error('Failed to delete role: ' . $e->getMessage(), null, 500);
        }
    }

    public function assignPermissions(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent editing Super Admin role
            if ($role->name === 'Super Admin') {
                return ResponseService::error('Cannot edit Super Admin role permissions', null, 403);
            }

            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'integer|exists:permissions,id'
            ]);

            // Get permission names from IDs
            $permissions = Permission::whereIn('id', $request->permissions)->pluck('name')->toArray();
            $role->syncPermissions($permissions);

            // Clear roles cache
            Cache::tags(['roles'])->flush();

            return ResponseService::success(
                new RoleResource($role->load('permissions')),
                'Permissions assigned successfully'
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to assign permissions: ' . $e->getMessage(), null, 500);
        }
    }
}
