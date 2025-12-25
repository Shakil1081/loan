<?php

namespace App\Http\Controllers;

use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;

class PermissionManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:permission.manage');
    }

    public function index(Request $request)
    {
        try {
            $query = Permission::query();

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where('name', 'like', "%{$search}%");
            }

            $permissions = $query->paginate(50);

            return response()->json($permissions);
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch permissions: ' . $e->getMessage(), null, 500);
        }
    }

    public function show($id)
    {
        $permission = Permission::findOrFail($id);
        return response()->json($permission);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:permissions',
                'guard_name' => 'sometimes|string|max:255'
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            $permission = Permission::create([
                'name' => $request->name,
                'guard_name' => $request->guard_name ?? 'web'
            ]);

            return ResponseService::success(
                $permission,
                'Permission created successfully',
                201
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to create permission: ' . $e->getMessage(), null, 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $permission = Permission::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:permissions,name,' . $id
            ]);

            if ($validator->fails()) {
                return ResponseService::validationError($validator->errors());
            }

            if ($request->has('name')) {
                $permission->name = $request->name;
                $permission->save();
            }

            return ResponseService::success(
                $permission,
                'Permission updated successfully'
            );
        } catch (\Exception $e) {
            return ResponseService::error('Failed to update permission: ' . $e->getMessage(), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            $permission = Permission::findOrFail($id);

            // Prevent deleting core permissions
            $corePermissions = [
                'loan.create',
                'loan.view',
                'loan.approve',
                'loan.delete',
                'user.manage',
                'role.manage',
                'permission.manage'
            ];

            if (in_array($permission->name, $corePermissions)) {
                return ResponseService::error('Cannot delete core system permissions', null, 403);
            }

            $permission->delete();

            return ResponseService::success(null, 'Permission deleted successfully');
        } catch (\Exception $e) {
            return ResponseService::error('Failed to delete permission: ' . $e->getMessage(), null, 500);
        }
    }

    public function getGrouped()
    {
        try {
            $permissions = Permission::all();
            $grouped = [];

            foreach ($permissions as $permission) {
                $parts = explode('.', $permission->name);
                $module = $parts[0] ?? 'general';
                
                if (!isset($grouped[$module])) {
                    $grouped[$module] = [];
                }
                
                $grouped[$module][] = $permission;
            }

            return response()->json($grouped);
        } catch (\Exception $e) {
            return ResponseService::error('Failed to fetch grouped permissions: ' . $e->getMessage(), null, 500);
        }
    }
}
