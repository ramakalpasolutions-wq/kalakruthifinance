'use client'

import { useState } from 'react'
import { useBills } from '@/context/BillContext'
import Link from 'next/link'
import BillCard from '@/components/BillCard'

export default function BillsPage() {
  const { bills, stats, loading } = useBills()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = bills.filter(bill => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && bill.status !== 'paid') ||
      (filter === 'paid' && bill.status === 'paid') ||
      (filter === 'recurring' && bill.isRecurring)
    
    const matchesSearch = search === '' ||
      bill.title.toLowerCase().includes(search.toLowerCase()) ||
      bill.category.toLowerCase().includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
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
          <h1 className="text-2xl font-bold text-slate-800">All Bills</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your bills and payments</p>
        </div>
        <Link
          href="/dashboard/bills/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add Bill
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-sky-500 p-4">
          <p className="text-sm text-slate-500">Upcoming</p>
          <p className="text-2xl font-bold text-sky-600">{stats.upcoming}</p>
          <p className="text-xs text-slate-400">₹{stats.totalUpcoming.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-rose-500 p-4">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-2xl font-bold text-rose-600">{stats.overdue}</p>
          <p className="text-xs text-slate-400">₹{stats.totalOverdue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500 p-4">
          <p className="text-sm text-slate-500">Recurring</p>
          <p className="text-2xl font-bold text-purple-600">{stats.recurring}</p>
          <p className="text-xs text-slate-400">₹{stats.totalMonthly.toLocaleString()}/mo</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-emerald-500 p-4">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
          <p className="text-xs text-slate-400">₹{stats.totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'recurring', label: 'Recurring' }
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
        </div>
      </div>

      {/* Bills List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧾</span>
          </div>
          <p className="text-slate-500">No bills found</p>
          <Link
            href="/dashboard/bills/add"
            className="inline-block mt-4 text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Add your first bill
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => (
            <BillCard key={bill._id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  )
}