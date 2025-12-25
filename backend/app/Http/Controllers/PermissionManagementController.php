<?php

namespace App\Http\Controllers;

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
        $query = Permission::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $permissions = $query->paginate(10);

        return response()->json($permissions);
    }

    public function show($id)
    {
        $permission = Permission::findOrFail($id);
        return response()->json($permission);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:permissions',
            'guard_name' => 'sometimes|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => $request->guard_name ?? 'web'
        ]);

        return response()->json([
            'message' => 'Permission created successfully',
            'permission' => $permission
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $permission = Permission::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:permissions,name,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $permission->name = $request->name;
            $permission->save();
        }

        return response()->json([
            'message' => 'Permission updated successfully',
            'permission' => $permission
        ]);
    }

    public function destroy($id)
    {
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
            return response()->json(['message' => 'Cannot delete core system permissions'], 403);
        }

        $permission->delete();

        return response()->json(['message' => 'Permission deleted successfully']);
    }

    public function getGrouped()
    {
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
    }
}
