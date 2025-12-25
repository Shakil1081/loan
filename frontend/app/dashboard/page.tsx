'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Users,
  Shield,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { Loan } from '@/lib/types';

export default function DashboardPage() {
  const { user, loading: authLoading, hasRole, hasPermission } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const endpoint = hasPermission('loan.approve') ? '/admin/loans' : '/loans/my-loans';
      const response = await axiosInstance.get(endpoint);
      const loanData = response.data.data || [];
      setLoans(loanData.slice(0, 5));
      
      setStats({
        total: loanData.length,
        pending: loanData.filter((l: Loan) => l.status === 'PENDING').length,
        approved: loanData.filter((l: Loan) => l.status === 'APPROVED').length,
        rejected: loanData.filter((l: Loan) => l.status === 'REJECTED').length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const quickActions = [
    {
      title: 'Apply for Loan',
      description: 'Submit a new loan application',
      icon: FileText,
      href: '/loan/apply',
      color: 'from-blue-500 to-indigo-600',
      show: hasPermission('loan.create'),
    },
    {
      title: 'My Loans',
      description: 'View your loan applications',
      icon: DollarSign,
      href: '/loans/my',
      color: 'from-emerald-500 to-teal-600',
      show: hasPermission('loan.view'),
    },
    {
      title: 'Manage Users',
      description: 'User administration',
      icon: Users,
      href: '/admin/users',
      color: 'from-purple-500 to-pink-600',
      show: hasPermission('user.manage'),
    },
    {
      title: 'Loan Applications',
      description: 'Review pending loans',
      icon: Shield,
      href: '/admin/loans',
      color: 'from-orange-500 to-red-600',
      show: hasPermission('loan.approve'),
    },
  ].filter(action => action.show);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg1MHYyNEgzNnptMC0zMGg1MHYyNEgzNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
            <p className="text-white/90 text-lg">Here's an overview of your loan management dashboard</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stats.total}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Applications</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stats.pending}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Pending Review</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stats.approved}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Approved</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stats.rejected}</p>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Rejected</p>
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{action.title}</h4>
                  <p className="text-sm text-slate-500 mb-3">{action.description}</p>
                  <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all duration-200">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Loans */}
        {loans.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Recent Applications</h3>
              <Link href="/loans/my" className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {loans.map((loan) => {
                  const statusConfig = getStatusConfig(loan.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={loan.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            #{loan.id}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-lg font-bold text-slate-800">
                                ${parseFloat(loan.amount).toLocaleString()}
                              </p>
                              <span className="text-sm text-slate-500">•</span>
                              <span className="text-sm text-slate-500">{loan.tenure} months</span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1">{loan.purpose}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} rounded-full`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{loan.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading dashboard data...</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
