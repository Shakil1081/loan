'use client'

import { useState, useEffect } from 'react'
import TopNavLayout from '@/components/TopNavLayout'
import axiosInstance from '@/lib/axios'

interface Loan {
  id: number
  amount: string
  tenure: number
  purpose: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  admin_comment: string | null
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
  }
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    admin_comment: ''
  })
  const [updating, setUpdating] = useState(false)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchLoans()
  }, [currentPage])

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/admin/loans?page=${currentPage}&per_page=10`)
      setLoans(response.data.data)
      setTotalPages(response.data.last_page)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedLoan || !statusUpdate.status) return
    
    setUpdating(true)
    try {
      await axiosInstance.put(`/admin/loans/${selectedLoan.id}/status`, {
        status: statusUpdate.status,
        admin_comment: statusUpdate.admin_comment
      })
      
      await fetchLoans()
      setModalOpen(false)
      setSelectedLoan(null)
      setStatusUpdate({ status: '', admin_comment: '' })
    } catch (error) {
      console.error('Failed to update loan status:', error)
      alert('Failed to update loan status')
    } finally {
      setUpdating(false)
    }
  }

  const openUpdateModal = (loan: Loan) => {
    setSelectedLoan(loan)
    setStatusUpdate({
      status: loan.status,
      admin_comment: loan.admin_comment || ''
    })
    setModalOpen(true)
  }

  const getStatusConfig = (status: string) => {
    const config = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' }
    }
    return config[status as keyof typeof config] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: status }
  }

  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    approved: loans.filter(l => l.status === 'APPROVED').length,
    rejected: loans.filter(l => l.status === 'REJECTED').length,
    totalAmount: loans.reduce((acc, l) => acc + parseFloat(l.amount), 0)
  }

  const filteredLoans = filter === 'ALL' ? loans : loans.filter(l => l.status === filter)

  return (
    <TopNavLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Loan Applications</h1>
            <p className="text-slate-500 mt-1">Review and process loan applications from users</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Data cached for</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium">60 seconds</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs text-slate-500">Total</p>
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
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">${stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-2">
          <div className="flex gap-2 overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  filter === status
                    ? 'text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                style={filter === status ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : {}}
              >
                {status === 'ALL' ? 'All Applications' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500">Loading applications...</p>
            </div>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Applications Found</h3>
            <p className="text-slate-500">
              {filter === 'ALL' ? 'No loan applications have been submitted yet.' : `No ${filter.toLowerCase()} applications found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => {
              const statusConfig = getStatusConfig(loan.status)
              return (
                <div key={loan.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          #{loan.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800">
                              ${parseFloat(loan.amount).toLocaleString()}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                              {statusConfig.label}
                            </span>
                            <span className="text-slate-400 text-sm">
                              {loan.tenure} months
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                              {loan.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-700 text-sm">{loan.user.name}</p>
                              <p className="text-slate-400 text-xs">{loan.user.email}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-slate-600 font-medium mb-1">Purpose</p>
                            <p className="text-sm text-slate-700">{loan.purpose}</p>
                          </div>
                          {loan.admin_comment && (
                            <div className={`rounded-lg p-3 ${statusConfig.bg} border ${statusConfig.border}`}>
                              <p className={`text-sm font-medium mb-1 ${statusConfig.text}`}>Admin Comment</p>
                              <p className={`text-sm ${statusConfig.text}`}>{loan.admin_comment}</p>
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-3">
                            Applied on {new Date(loan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex lg:flex-col gap-2">
                        <button
                          onClick={() => openUpdateModal(loan)}
                          className="flex-1 lg:flex-none px-4 py-2 text-white font-medium rounded-xl text-sm transition-all hover:-translate-y-0.5"
                          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        currentPage === page ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
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
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Update Status Modal */}
        {modalOpen && selectedLoan && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setModalOpen(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Update Loan Status</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Loan #{selectedLoan.id} • {selectedLoan.user.name}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-semibold text-slate-800">${parseFloat(selectedLoan.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-500">Tenure</span>
                    <span className="font-semibold text-slate-800">{selectedLoan.tenure} months</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['PENDING', 'APPROVED', 'REJECTED'].map((status) => {
                        const config = getStatusConfig(status)
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setStatusUpdate({ ...statusUpdate, status })}
                            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
                              statusUpdate.status === status
                                ? `${config.bg} ${config.text} ${config.border}`
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {config.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Comment</label>
                    <textarea
                      rows={3}
                      value={statusUpdate.admin_comment}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, admin_comment: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                      placeholder="Add a comment for the applicant..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating || !statusUpdate.status}
                    className="flex-1 py-3 px-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    {updating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TopNavLayout>
  )
}
