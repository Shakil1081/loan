<?php

namespace App\Models;

use App\Traits\TracksUserActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Loan extends Model
{
    use HasFactory, TracksUserActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'amount',
        'tenure',
        'purpose',
        'status',
        'admin_comment',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'tenure' => 'integer',
    ];

    /**
     * Get the user that owns the loan.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the creator of the loan.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the last updater of the loan.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
