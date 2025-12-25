'use client'

import { useState, useEffect } from 'react'
import TopNavLayout from '@/components/TopNavLayout'
import axiosInstance from '@/lib/axios'
import Link from 'next/link'

interface Loan {
  id: number
  amount: string
  tenure: number
  purpose: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  admin_comment: string | null
  created_at: string
  updated_at: string
}

export default function MyLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)

  useEffect(() => {
    fetchLoans()
  }, [currentPage])

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/loans/my-loans?page=${currentPage}`)
      setLoans(response.data.data)
      setTotalPages(response.data.last_page)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const config = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '⏳', label: 'Pending Review' },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✓', label: 'Approved' },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '✗', label: 'Rejected' }
    }
    return config[status as keyof typeof config] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '?', label: status }
  }

  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    approved: loans.filter(l => l.status === 'APPROVED').length,
    rejected: loans.filter(l => l.status === 'REJECTED').length,
  }

  return (
    <TopNavLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Loan Applications</h1>
            <p className="text-slate-500 mt-1">Track and manage your loan applications</p>
          </div>
          <Link
            href="/loan/apply"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Application
          </Link>
        </div>

        {/* Stats Cards */}
        {!loading && loans.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  <p className="text-xs text-slate-500">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
                  <p className="text-xs text-slate-500">Approved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-xs text-slate-500">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500">Loading your loans...</p>
            </div>
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Loan Applications Yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              You haven&apos;t submitted any loan applications. Get started by applying for your first loan.
            </p>
            <Link
              href="/loan/apply"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Apply for Loan
            </Link>
          </div>
        ) : (
          <>
            {/* Loan Cards */}
            <div className="space-y-4">
              {loans.map((loan) => {
                const statusConfig = getStatusConfig(loan.status)
                return (
                  <div 
                    key={loan.id} 
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <span className="text-white font-bold">#{loan.id}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold text-slate-800">
                                ${parseFloat(loan.amount).toLocaleString()}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-slate-500 text-sm">
                              {loan.tenure} months • Applied on {new Date(loan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedLoan(selectedLoan?.id === loan.id ? null : loan)}
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                          {selectedLoan?.id === loan.id ? 'Hide Details' : 'View Details'}
                          <svg className={`w-4 h-4 transition-transform ${selectedLoan?.id === loan.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {selectedLoan?.id === loan.id && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-500 mb-2">Purpose</h4>
                              <p className="text-slate-700 bg-slate-50 rounded-lg p-3 text-sm">
                                {loan.purpose}
                              </p>
                            </div>
                            {loan.admin_comment && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-2">Admin Comment</h4>
                                <p className={`rounded-lg p-3 text-sm ${statusConfig.bg} ${statusConfig.text}`}>
                                  {loan.admin_comment}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      style={currentPage === page ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : {}}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </TopNavLayout>
  )
}
