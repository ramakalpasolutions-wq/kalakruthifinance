'use client'

import { useEmis } from '@/context/EMIContext'
import Link from 'next/link'
import EMICard from '@/components/EMICard'

export default function EMIDuePage() {
  const { emisDueThisMonth, stats, loading } = useEmis()

  const formatMonth = () => {
    return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">EMIs Due This Month</h1>
          <p className="text-slate-500 text-sm mt-1">{formatMonth()}</p>
        </div>
        <Link
          href="/dashboard/emi"
          className="text-indigo-600 font-medium text-sm hover:text-indigo-700"
        >
          ← All EMIs
        </Link>
      </div>

      {/* Summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="font-semibold text-amber-800">
                {stats.dueThisMonth} EMI{stats.dueThisMonth !== 1 ? 's' : ''} Due This Month
              </p>
              <p className="text-sm text-amber-600">Pay before due date to avoid late fees</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-700">
            ₹{stats.dueThisMonthAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* EMI List */}
      {emisDueThisMonth.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-slate-600 font-medium">All Clear!</p>
          <p className="text-slate-400 text-sm mt-1">No EMIs due this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emisDueThisMonth.map((emi) => (
            <EMICard key={emi._id} emi={emi} />
          ))}
        </div>
      )}
    </div>
  )
}