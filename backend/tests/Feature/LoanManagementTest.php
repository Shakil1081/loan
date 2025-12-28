<?php

namespace Tests\Feature;

use App\Models\Loan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $applicant;
    protected $admin;
    protected $applicantToken;
    protected $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        // Create applicant user
        $this->applicant = User::factory()->create(['email' => 'applicant@test.com']);
        $this->applicant->assignRole('Applicant');
        $this->applicantToken = $this->applicant->createToken('test-token')->plainTextToken;

        // Create admin user
        $this->admin = User::factory()->create(['email' => 'admin@test.com']);
        $this->admin->assignRole('Super Admin');
        $this->adminToken = $this->admin->createToken('test-token')->plainTextToken;
    }

    public function test_applicant_can_submit_loan_application()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->applicantToken)
            ->postJson('/api/loans/apply', [
                'amount' => 50000,
                'tenure' => 24,
                'purpose' => 'Home renovation'
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'amount',
                    'tenure',
                    'purpose',
                    'status'
                ]
            ]);

        $this->assertDatabaseHas('loans', [
            'user_id' => $this->applicant->id,
            'amount' => 50000,
            'tenure' => 24,
            'status' => 'PENDING'
        ]);
    }

    public function test_applicant_cannot_submit_loan_with_invalid_data()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->applicantToken)
            ->postJson('/api/loans/apply', [
                'amount' => -1000, // Invalid amount
                'tenure' => 150, // Invalid tenure
                'purpose' => ''
            ]);

        $response->assertStatus(422);
    }

    public function test_applicant_can_view_own_loans()
    {
        Loan::factory()->count(3)->create(['user_id' => $this->applicant->id]);
        Loan::factory()->count(2)->create(); // Other user's loans

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->applicantToken)
            ->getJson('/api/loans');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'amount', 'tenure', 'purpose', 'status']
                ]
            ]);

        // Should only see own loans
        $this->assertCount(3, $response->json('data'));
    }

    public function test_applicant_cannot_view_other_users_loans()
    {
        $otherUser = User::factory()->create();
        $loan = Loan::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->applicantToken)
            ->getJson("/api/loans/{$loan->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_view_all_loans()
    {
        Loan::factory()->count(5)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/admin/loans');

        $response->assertStatus(200);
    }

    public function test_admin_can_approve_loan()
    {
        $loan = Loan::factory()->create(['status' => 'PENDING']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/admin/loans/{$loan->id}/status", [
                'status' => 'APPROVED',
                'admin_comment' => 'Application approved based on good credit history.'
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('loans', [
            'id' => $loan->id,
            'status' => 'APPROVED'
        ]);
    }

    public function test_admin_can_reject_loan()
    {
        $loan = Loan::factory()->create(['status' => 'PENDING']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/admin/loans/{$loan->id}/status", [
                'status' => 'REJECTED',
                'admin_comment' => 'Insufficient documentation provided.'
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('loans', [
            'id' => $loan->id,
            'status' => 'REJECTED'
        ]);
    }

    public function test_applicant_cannot_approve_loans()
    {
        $loan = Loan::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->applicantToken)
            ->patchJson("/api/admin/loans/{$loan->id}/status", [
                'status' => 'APPROVED'
            ]);

        $response->assertStatus(403);
    }

    public function test_loan_status_can_only_be_valid_values()
    {
        $loan = Loan::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/admin/loans/{$loan->id}/status", [
                'status' => 'INVALID_STATUS'
            ]);

        $response->assertStatus(422);
    }
}
