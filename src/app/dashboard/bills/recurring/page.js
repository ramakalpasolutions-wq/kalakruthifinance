'use client'

import { useBills } from '@/context/BillContext'
import Link from 'next/link'
import BillCard from '@/components/BillCard'

export default function RecurringBillsPage() {
  const { recurringBills, stats, loading } = useBills()

  // Group by frequency
  const byFrequency = {
    weekly: recurringBills.filter(b => b.frequency === 'weekly'),
    monthly: recurringBills.filter(b => b.frequency === 'monthly'),
    quarterly: recurringBills.filter(b => b.frequency === 'quarterly'),
    yearly: recurringBills.filter(b => b.frequency === 'yearly')
  }

  const frequencyLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
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
          <h1 className="text-2xl font-bold text-slate-800">Recurring Bills</h1>
          <p className="text-slate-500 text-sm mt-1">Bills that repeat automatically</p>
        </div>
        <Link
          href="/dashboard/bills/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add Recurring Bill
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500 p-4">
          <p className="text-sm text-slate-500">Total Recurring</p>
          <p className="text-2xl font-bold text-purple-600">{stats.recurring}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-sky-500 p-4">
          <p className="text-sm text-slate-500">Monthly</p>
          <p className="text-2xl font-bold text-sky-600">{byFrequency.monthly.length}</p>
          <p className="text-xs text-slate-400">
            ₹{byFrequency.monthly.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}/mo
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-500 p-4">
          <p className="text-sm text-slate-500">Quarterly</p>
          <p className="text-2xl font-bold text-amber-600">{byFrequency.quarterly.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-emerald-500 p-4">
          <p className="text-sm text-slate-500">Yearly</p>
          <p className="text-2xl font-bold text-emerald-600">{byFrequency.yearly.length}</p>
        </div>
      </div>

      {/* Monthly Summary */}
      {byFrequency.monthly.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🔄</span>
              </div>
              <div>
                <p className="font-medium text-purple-800">Monthly Expenses</p>
                <p className="text-sm text-purple-600">
                  {byFrequency.monthly.length} recurring bills
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              ₹{stats.totalMonthly.toLocaleString()}/mo
            </p>
          </div>
        </div>
      )}

      {/* Bills List */}
      {recurringBills.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-slate-500">No recurring bills set up</p>
          <Link
            href="/dashboard/bills/add"
            className="inline-block mt-4 text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Add recurring bill
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recurringBills.map((bill) => (
            <BillCard key={bill._id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  )
}