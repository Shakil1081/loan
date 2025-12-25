'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNavLayout from '@/components/TopNavLayout'
import axiosInstance from '@/lib/axios'

export default function LoanApplyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    amount: '',
    tenure: '',
    purpose: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axiosInstance.post('/loans', {
        amount: parseFloat(formData.amount),
        tenure: parseInt(formData.tenure),
        purpose: formData.purpose
      })
      setSuccess(true)
      setTimeout(() => {
        router.push('/loans/my')
      }, 1500)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit loan application')
    } finally {
      setLoading(false)
    }
  }

  const tenureOptions = [
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' },
    { value: 24, label: '24 months' },
    { value: 36, label: '36 months' },
    { value: 48, label: '48 months' },
    { value: 60, label: '60 months' },
  ]

  if (success) {
    return (
      <TopNavLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
            <p className="text-slate-500">Your loan application has been submitted successfully. Redirecting...</p>
          </div>
        </div>
      </TopNavLayout>
    )
  }

  return (
    <TopNavLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Apply for Loan</h1>
            <p className="text-slate-500">Fill in the details below to submit your application</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                1
              </div>
              <span className="text-sm font-medium text-slate-700">Loan Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Amount Field */}
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-2">
                Loan Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="1"
                  max="999999999"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="50,000.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">Enter the amount you wish to borrow</p>
            </div>

            {/* Tenure Field */}
            <div>
              <label htmlFor="tenure" className="block text-sm font-semibold text-slate-700 mb-2">
                Loan Tenure
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {tenureOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, tenure: option.value.toString() })}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.tenure === option.value.toString()
                        ? 'text-white shadow-lg'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={formData.tenure === option.value.toString() ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="tenure"
                  id="tenure"
                  required
                  min="1"
                  max="360"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Or enter custom months (1-360)"
                  value={formData.tenure}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">months</span>
                </div>
              </div>
            </div>

            {/* Purpose Field */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-semibold text-slate-700 mb-2">
                Purpose of Loan
              </label>
              <textarea
                name="purpose"
                id="purpose"
                rows={4}
                required
                maxLength={1000}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                placeholder="Please describe why you need this loan and how you plan to use the funds..."
                value={formData.purpose}
                onChange={handleInputChange}
              />
              <div className="flex justify-between mt-2">
                <p className="text-sm text-slate-500">Be as detailed as possible</p>
                <p className="text-sm text-slate-400">{formData.purpose.length}/1000</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Summary Card */}
            {formData.amount && formData.tenure && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="font-semibold text-slate-800 mb-3">Application Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Loan Amount</span>
                    <p className="font-semibold text-slate-800">${parseFloat(formData.amount || '0').toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tenure</span>
                    <p className="font-semibold text-slate-800">{formData.tenure} months</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Important Notice</h4>
              <p className="text-sm text-amber-700">
                Your application will be reviewed by our admin team. You will be notified once a decision has been made.
                Processing typically takes 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TopNavLayout>
  )
}
