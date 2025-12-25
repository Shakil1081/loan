<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LoanController extends Controller
{
    /**
     * Submit a new loan application (Applicant)
     */
    public function store(Request $request)
    {
        $this->authorize('create', Loan::class);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:999999999',
            'tenure' => 'required|integer|min:1|max:360',
            'purpose' => 'required|string|max:1000',
        ]);

        $loan = $request->user()->loans()->create($validated);

        return response()->json([
            'message' => 'Loan application submitted successfully',
            'loan' => $loan->load('user')
        ], 201);
    }

    /**
     * Get authenticated user's loan history (Applicant)
     */
    public function myLoans(Request $request)
    {
        $loans = $request->user()->loans()
            ->with(['user', 'creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($loans);
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

        return response()->json([
            'message' => 'Loan status updated successfully',
            'loan' => $loan->load('user', 'creator', 'updater')
        ]);
    }

    /**
     * Get single loan details
     */
    public function show(Request $request, $id)
    {
        $loan = Loan::with(['user', 'creator', 'updater'])->findOrFail($id);
        
        $this->authorize('view', $loan);

        return response()->json($loan);
    }
}
