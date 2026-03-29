'use client'

import { useBills } from '@/context/BillContext'
import Link from 'next/link'
import BillCard from '@/components/BillCard'

export default function UpcomingBillsPage() {
  const { upcomingBills, stats, dueSoonBills, loading } = useBills()

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
          <h1 className="text-2xl font-bold text-slate-800">Upcoming Bills</h1>
          <p className="text-slate-500 text-sm mt-1">Bills due in the future</p>
        </div>
        <Link
          href="/dashboard/bills/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add Bill
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-sky-500 p-5">
          <p className="text-sm text-slate-500">Total Upcoming</p>
          <p className="text-3xl font-bold text-sky-600 mt-1">{stats.upcoming}</p>
          <p className="text-sm text-slate-400 mt-1">₹{stats.totalUpcoming.toLocaleString()} total</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-500 p-5">
          <p className="text-sm text-slate-500">Due This Week</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{dueSoonBills.length}</p>
          <p className="text-sm text-slate-400 mt-1">
            ₹{dueSoonBills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-rose-500 p-5">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-3xl font-bold text-rose-600 mt-1">{stats.overdue}</p>
          <p className="text-sm text-slate-400 mt-1">₹{stats.totalOverdue.toLocaleString()}</p>
        </div>
      </div>

      {/* Due Soon Alert */}
      {dueSoonBills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <p className="font-medium text-amber-800">
                {dueSoonBills.length} bill{dueSoonBills.length > 1 ? 's' : ''} due within 7 days
              </p>
              <p className="text-sm text-amber-600">
                Total: ₹{dueSoonBills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bills List */}
      {upcomingBills.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-slate-600 font-medium">All Caught Up!</p>
          <p className="text-slate-400 text-sm mt-1">No upcoming bills</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingBills.map((bill) => (
            <BillCard key={bill._id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  )
}