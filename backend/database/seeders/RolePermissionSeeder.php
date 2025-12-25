<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'loan.view',
            'loan.create',
            'loan.approve',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $superAdmin = Role::create(['name' => 'Super Admin']);
        $applicant = Role::create(['name' => 'Applicant']);

        // Assign permissions to roles
        // Super Admin gets all permissions
        $superAdmin->givePermissionTo(Permission::all());

        // Applicant can view and create loans
        $applicant->givePermissionTo(['loan.view', 'loan.create']);
    }
}
