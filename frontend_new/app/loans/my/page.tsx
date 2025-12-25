'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { DollarSign, Clock, CheckCircle, XCircle, FileText, Calendar } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Loan } from '@/lib/types';

export default function MyLoansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchLoans();
    }
  }, [user, authLoading, router]);

  const fetchLoans = async () => {
    try {
      const response = await axiosInstance.get('/loans/my-loans');
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: 'Approved' },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Rejected' },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const filteredLoans = filter === 'ALL' ? loans : loans.filter(loan => loan.status === filter);

  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    approved: loans.filter(l => l.status === 'APPROVED').length,
    rejected: loans.filter(l => l.status === 'REJECTED').length,
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">My Loans</h1>
            <p className="text-slate-500">Track all your loan applications</p>
          </div>
          <button
            onClick={() => router.push('/loan/apply')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Apply New Loan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-slate-100">
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-sm text-slate-500">Total</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 shadow-md border border-amber-200">
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
            <p className="text-sm text-amber-600">Pending</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 shadow-md border border-emerald-200">
            <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
            <p className="text-sm text-emerald-600">Approved</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-md border border-red-200">
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-sm text-red-600">Rejected</p>
          </div>
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
              {status === 'ALL' ? 'All Loans' : status}
            </button>
          ))}
        </div>

        {/* Loans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No loans found</h3>
            <p className="text-slate-500 mb-6">You haven't applied for any loans yet.</p>
            <button
              onClick={() => router.push('/loan/apply')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl"
            >
              Apply for a Loan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => {
              const statusConfig = getStatusConfig(loan.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={loan.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        #{loan.id}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">${parseFloat(loan.amount).toLocaleString()}</p>
                        <p className="text-slate-500">{loan.tenure} months • {loan.purpose}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(loan.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} rounded-full self-start md:self-center`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-semibold">{statusConfig.label}</span>
                    </div>
                  </div>
                  {loan.admin_comment && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm font-semibold text-slate-600 mb-1">Admin Comment:</p>
                      <p className="text-slate-700">{loan.admin_comment}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
