<?php

namespace Database\Factories;

use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Loan>
 */
class LoanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => fake()->randomFloat(2, 1000, 100000),
            'tenure' => fake()->numberBetween(1, 120),
            'purpose' => fake()->sentence(10),
            'status' => fake()->randomElement(['PENDING', 'APPROVED', 'REJECTED']),
            'admin_comment' => null,
            'created_by' => function (array $attributes) {
                return $attributes['user_id'];
            },
            'updated_by' => function (array $attributes) {
                return $attributes['user_id'];
            },
        ];
    }

    /**
     * Indicate that the loan is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'PENDING',
            'admin_comment' => null,
        ]);
    }

    /**
     * Indicate that the loan is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'APPROVED',
            'admin_comment' => 'Loan approved',
        ]);
    }

    /**
     * Indicate that the loan is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'REJECTED',
            'admin_comment' => 'Loan rejected',
        ]);
    }
}
