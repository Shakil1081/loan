'use client'

import { useState, useEffect } from 'react'
import TopNavLayout from '@/components/TopNavLayout'
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'
import Can from '@/components/Can'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const isSuperAdmin = hasRole('Super Admin')
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalUsers: 0,
    totalRoles: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      if (isSuperAdmin) {
        // Admin stats
        const [loansRes, usersRes, rolesRes] = await Promise.all([
          axiosInstance.get('/admin/loans').catch(() => ({ data: { data: [] } })),
          axiosInstance.get('/admin/users').catch(() => ({ data: { data: [] } })),
          axiosInstance.get('/admin/roles').catch(() => ({ data: { data: [] } }))
        ])

        const loans = loansRes.data.data || []
        setStats({
          totalLoans: loans.length,
          pendingLoans: loans.filter((l: any) => l.status === 'PENDING').length,
          approvedLoans: loans.filter((l: any) => l.status === 'APPROVED').length,
          rejectedLoans: loans.filter((l: any) => l.status === 'REJECTED').length,
          totalUsers: usersRes.data.data?.length || 0,
          totalRoles: rolesRes.data.data?.length || 0
        })
      } else {
        // User stats
        const response = await axiosInstance.get('/loans/my-loans')
        const loans = response.data.data || []

        setStats({
          totalLoans: loans.length,
          pendingLoans: loans.filter((l: any) => l.status === 'PENDING').length,
          approvedLoans: loans.filter((l: any) => l.status === 'APPROVED').length,
          rejectedLoans: loans.filter((l: any) => l.status === 'REJECTED').length,
          totalUsers: 0,
          totalRoles: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TopNavLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-white/80 text-lg">
              {isSuperAdmin
                ? 'You have full administrative access to manage all loan applications.'
                : 'Track your loan applications and apply for new loans easily.'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Loans */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Loans</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalLoans}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Loans */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingLoans}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Approved Loans */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-3xl font-bold text-gray-800">{stats.approvedLoans}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Rejected Loans */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-gray-800">{stats.rejectedLoans}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l3-3m-3 3l-3-3m4 4h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Can perform="loan.create">
            <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Apply for Loan</p>
                  <Link href="/loan/apply" className="text-3xl font-bold text-emerald-600 hover:text-emerald-700">
                    Apply Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Can>

          <Can perform="loan.view">
            <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">My Loans</p>
                  <Link href="/loans/my" className="text-3xl font-bold text-blue-600 hover:text-blue-700">
                    View Loans
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Can>

          <Can perform="loan.approve">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Admin</h3>
              <Link href="/admin/loans" className="text-xl font-bold text-amber-600 hover:text-amber-700 mt-1 flex items-center gap-2">
                Manage Loans
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Can>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Account Information</h3>
                <p className="text-sm text-slate-500">Your personal details and permissions</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-48">Full Name</span>
              <span className="text-sm text-slate-800 font-medium">{user?.name}</span>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-48">Email Address</span>
              <span className="text-sm text-slate-800">{user?.email}</span>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-48">Account Role</span>
              <div className="flex flex-wrap gap-2">
                {user?.roles?.map(r => (
                  <span key={r.id} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    r.name === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-48">Permissions</span>
              <div className="flex flex-wrap gap-2">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All Permissions (Super Admin)
                  </span>
                ) : (
                  user?.permissions?.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {p.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Quick Tips</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {isSuperAdmin ? (
                  <>
                    <li>• Review pending loan applications in the Manage Loans section</li>
                    <li>• You can approve or reject loans with comments</li>
                    <li>• All loan data is cached for 60 seconds for better performance</li>
                  </>
                ) : (
                  <>
                    <li>• Click &quot;Apply for Loan&quot; to submit a new loan application</li>
                    <li>• Track your application status in &quot;My Loans&quot;</li>
                    <li>• You&apos;ll receive updates when your loan status changes</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TopNavLayout>
  )
}
