'use client'

import { useState } from 'react'
import { useEmis } from '@/context/EMIContext'
import Link from 'next/link'
import EMICard from '@/components/EMICard'

export default function EMIPage() {
  const { emis, stats, loading } = useEmis()
  const [filter, setFilter] = useState('all')

  const filtered = emis.filter(emi => {
    if (filter === 'all') return true
    if (filter === 'active') return emi.status === 'active'
    if (filter === 'completed') return emi.status === 'completed'
    return true
  })

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
          <h1 className="text-2xl font-bold text-slate-800">EMI Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Track all your loan EMIs</p>
        </div>
        <Link
          href="/dashboard/emi/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add EMI
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-indigo-500 p-4">
          <p className="text-sm text-slate-500">Active EMIs</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.active}</p>
          <p className="text-xs text-slate-400">₹{stats.totalMonthlyEmi.toLocaleString()}/month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-500 p-4">
          <p className="text-sm text-slate-500">Remaining EMIs</p>
          <p className="text-2xl font-bold text-amber-600">{stats.totalRemainingEmis}</p>
          <p className="text-xs text-slate-400">across all loans</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-rose-500 p-4">
          <p className="text-sm text-slate-500">Total Remaining</p>
          <p className="text-2xl font-bold text-rose-600">₹{stats.totalRemaining.toLocaleString()}</p>
          <p className="text-xs text-slate-400">to be paid</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-emerald-500 p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
          <p className="text-xs text-slate-400">₹{stats.totalPaid.toLocaleString()} paid</p>
        </div>
      </div>

      {/* Monthly Summary */}
      {stats.active > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <p className="font-semibold text-indigo-800">Monthly EMI Outflow</p>
                <p className="text-sm text-indigo-600">{stats.active} active loans</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-700">
              ₹{stats.totalMonthlyEmi.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* EMI List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏦</span>
          </div>
          <p className="text-slate-500">No EMIs found</p>
          <Link
            href="/dashboard/emi/add"
            className="inline-block mt-4 text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Add your first EMI
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((emi) => (
            <EMICard key={emi._id} emi={emi} />
          ))}
        </div>
      )}
    </div>
  )
}