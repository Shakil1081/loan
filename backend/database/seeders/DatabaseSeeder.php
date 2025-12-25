<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create Super Admin user
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('Super@2025'),
        ]);

        // Assign Super Admin role
        $superAdmin->assignRole('Super Admin');

        // Create Test Applicant user
        $applicant = User::create([
            'name' => 'Test Applicant',
            'email' => 'applicant@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Assign Applicant role
        $applicant->assignRole('Applicant');
    }
}
