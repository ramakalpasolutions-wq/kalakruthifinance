'use client'

import { useBills } from '@/context/BillContext'
import Link from 'next/link'
import BillCard from '@/components/BillCard'

export default function OverdueBillsPage() {
  const { overdueBills, stats, loading } = useBills()

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
          <h1 className="text-2xl font-bold text-slate-800">Overdue Bills</h1>
          <p className="text-slate-500 text-sm mt-1">Bills that are past due date</p>
        </div>
        <Link
          href="/dashboard/bills"
          className="text-indigo-600 font-medium text-sm hover:text-indigo-700"
        >
          ← All Bills
        </Link>
      </div>

      {/* Alert */}
      {overdueBills.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-rose-800">
                {overdueBills.length} Overdue Bill{overdueBills.length > 1 ? 's' : ''}
              </p>
              <p className="text-rose-600">
                Total Amount: ₹{stats.totalOverdue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bills List */}
      {overdueBills.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-slate-600 font-medium">No Overdue Bills!</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {overdueBills.map((bill) => (
            <BillCard key={bill._id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  )
}