<?php

namespace App\Http\Controllers;

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
        $query = Role::with('permissions');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $roles = $query->paginate(10);

        return response()->json($roles);
    }

    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role->load('permissions')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Prevent editing Super Admin role
        if ($role->name === 'Super Admin') {
            return response()->json(['message' => 'Cannot edit Super Admin role'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $id,
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $role->name = $request->name;
            $role->save();
        }

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $role->load('permissions')
        ]);
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        // Prevent deleting Super Admin or Applicant roles
        if (in_array($role->name, ['Super Admin', 'Applicant'])) {
            return response()->json(['message' => 'Cannot delete system roles'], 403);
        }

        // Check if role is assigned to any users
        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Cannot delete role that is assigned to users'], 400);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }

    public function assignPermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Prevent editing Super Admin role
        if ($role->name === 'Super Admin') {
            return response()->json(['message' => 'Cannot edit Super Admin role permissions'], 403);
        }

        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role->syncPermissions($request->permissions);

        return response()->json([
            'message' => 'Permissions assigned successfully',
            'role' => $role->load('permissions')
        ]);
    }
}
