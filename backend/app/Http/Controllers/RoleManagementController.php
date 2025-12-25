<?php

namespace App\Http\Controllers;

use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
            $query = Role::with('permissions');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where('name', 'like', "%{$search}%");
            }

            $roles = $query->paginate(15);

            return response()->json($roles);
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch roles: ' . $e->getMessage(), null, 500);
        }
    }

    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles',
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            $role = Role::create(['name' => $request->name]);

            return ResponseService::success(
                $role->load('permissions'),
                'Role created successfully',
                201
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to create role: ' . $e->getMessage(), null, 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent editing Super Admin role
            if ($role->name === 'Super Admin') {
                return ResponseService::error('Cannot edit Super Admin role', null, 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $id,
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            if ($request->has('name')) {
                $role->name = $request->name;
                $role->save();
            }

            return ResponseService::success(
                $role->load('permissions'),
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

            $validator = Validator::make($request->all(), [
                'permissions' => 'required|array',
                'permissions.*' => 'integer|exists:permissions,id'
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            // Get permission names from IDs
            $permissions = Permission::whereIn('id', $request->permissions)->pluck('name')->toArray();
            $role->syncPermissions($permissions);

            return ResponseService::success(
                $role->load('permissions'),
                'Permissions assigned successfully'
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to assign permissions: ' . $e->getMessage(), null, 500);
        }
    }
}
