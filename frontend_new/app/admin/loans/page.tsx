'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FileText, Clock, CheckCircle, XCircle, User, Loader2, X } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Loan } from '@/lib/types';

export default function AdminLoansPage() {
  const { user, loading: authLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [approvingLoan, setApprovingLoan] = useState(false);
  const [rejectingLoan, setRejectingLoan] = useState(false);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchLoans();
    }
  }, [user, authLoading, router]);

  const fetchLoans = async () => {
    try {
      const response = await axiosInstance.get('/admin/loans');
      
      // Handle ResponseService format with pagination: { success: true, data: { data: [...], ... } }
      let loansData = [];
      if (response.data.data) {
        loansData = Array.isArray(response.data.data) 
          ? response.data.data 
          : (response.data.data.data || []);
      } else if (Array.isArray(response.data)) {
        loansData = response.data;
      }
      
      setLoans(loansData);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLoanStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLoan) return;
    if (status === 'APPROVED') {
      setApprovingLoan(true);
    } else {
      setRejectingLoan(true);
    }
    try {
      await axiosInstance.patch(`/admin/loans/${selectedLoan.id}/status`, {
        status,
        admin_comment: adminComment,
      });
      await fetchLoans();
      setSelectedLoan(null);
      setAdminComment('');
      alert(`Loan ${status.toLowerCase()} successfully!`);
    } catch (error: any) {
      console.error('Failed to update loan:', error);
      alert(error.response?.data?.message || 'Failed to update loan status');
    } finally {
      setApprovingLoan(false);
      setRejectingLoan(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const filteredLoans = filter === 'ALL' ? loans : loans.filter(loan => loan.status === filter);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Loan Applications</h1>
          <p className="text-slate-500">Review and manage all loan applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status} ({status === 'ALL' ? loans.length : loans.filter(l => l.status === status).length})
            </button>
          ))}
        </div>

        {/* Loans Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Applicant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Tenure</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.map((loan) => {
                    const statusConfig = getStatusConfig(loan.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={loan.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-semibold text-slate-800">#{loan.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-slate-700">{loan.user?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">${parseFloat(loan.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">{loan.tenure} months</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} rounded-full text-sm font-semibold`}>
                            <StatusIcon className="w-4 h-4" />
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(loan.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {loan.status === 'PENDING' && (
                            <button
                              onClick={() => setSelectedLoan(loan)}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {selectedLoan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Review Loan #{selectedLoan.id}</h3>
                <button onClick={() => setSelectedLoan(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="text-xl font-bold text-slate-800">${parseFloat(selectedLoan.amount).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Tenure</p>
                    <p className="text-xl font-bold text-slate-800">{selectedLoan.tenure} months</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Purpose</p>
                  <p className="text-slate-800">{selectedLoan.purpose}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Comment</label>
                  <textarea
                    rows={3}
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    placeholder="Add a comment (optional)"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => updateLoanStatus('APPROVED')}
                  disabled={approvingLoan || rejectingLoan}
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approvingLoan ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Approve
                </button>
                <button
                  onClick={() => updateLoanStatus('REJECTED')}
                  disabled={approvingLoan || rejectingLoan}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rejectingLoan ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
