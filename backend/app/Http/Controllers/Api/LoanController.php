<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LoanController extends Controller
{
    /**
     * Submit a new loan application (Applicant)
     */
    public function apply(Request $request)
    {
        $this->authorize('create', Loan::class);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:999999999',
            'tenure' => 'required|integer|min:1|max:360',
            'purpose' => 'required|string|max:1000',
        ]);

        $loan = $request->user()->loans()->create($validated);
        
        // Refresh to get default values from database
        $loan->refresh();

        return ResponseService::success(
            $loan->load('user'),
            'Loan application submitted successfully',
            201
        );
    }

    /**
     * Get authenticated user's loan history (Applicant)
     */
    public function myLoans(Request $request)
    {
        $loans = $request->user()->loans()
            ->with(['user', 'creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ResponseService::success($loans);
    }

    /**
     * Get all loans (Admin) - with caching
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Loan::class);

        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 10);
        
        $loans = Cache::remember("loans_page_{$page}_per_{$perPage}", 60, function () use ($perPage) {
            return Loan::with(['user', 'creator', 'updater'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        });

        return response()->json($loans);
    }

    /**
     * Update loan status (Admin)
     */
    public function updateStatus(Request $request, $id)
    {
        $loan = Loan::findOrFail($id);
        
        $this->authorize('approve', $loan);

        $validated = $request->validate([
            'status' => 'required|in:APPROVED,REJECTED',
            'admin_comment' => 'nullable|string|max:1000',
        ]);

        $loan->update($validated);

        // Clear cache when loan status is updated
        Cache::flush();

        return ResponseService::success(
            $loan->load('user', 'creator', 'updater'),
            'Loan status updated successfully'
        );
    }

    /**
     * Get single loan details
     */
    public function show(Request $request, $id)
    {
        $loan = Loan::with(['user', 'creator', 'updater'])->findOrFail($id);
        
        $this->authorize('view', $loan);

        return ResponseService::success($loan);
    }
}
