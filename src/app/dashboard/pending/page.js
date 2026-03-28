'use client'

import { useTransactions } from '@/context/TransactionContext'
import TransactionList from '@/components/TransactionList'
import StatsCard from '@/components/StatsCard'
import { useState } from 'react'

export default function PendingPage() {
  const { pendingTransactions, stats, loading } = useTransactions()
  const [filter, setFilter] = useState('all')

  const filtered = pendingTransactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pending Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">All your pending debts and dues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Pending"
          amount={stats.pendingToReceive + stats.pendingToPay}
          icon="⏳"
          variant="warning"
          subtitle={`${stats.pendingCount} transactions`}
        />
        <StatsCard
          title="To Receive"
          amount={stats.pendingToReceive}
          icon="📤"
          variant="success"
          subtitle={`${stats.pendingGivenCount} people owe you`}
        />
        <StatsCard
          title="To Pay"
          amount={stats.pendingToPay}
          icon="📥"
          variant="danger"
          subtitle={`You owe ${stats.pendingTakenCount} people`}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 inline-flex">
        {[
          { value: 'all', label: 'All Pending' },
          { value: 'given', label: 'To Receive' },
          { value: 'taken', label: 'To Pay' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={filtered}
        emptyMessage="No pending transactions! 🎉"
      />
    </div>
  )
}