'use client'

import { useTransactions } from '@/context/TransactionContext'
import TransactionList from '@/components/TransactionList'
import StatsCard from '@/components/StatsCard'

export default function TakenPage() {
  const { transactions, stats, loading } = useTransactions()
  const taken = transactions.filter(t => t.type === 'taken')

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Money Taken</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Total Taken" amount={stats.totalTaken} icon="📥" color="orange" />
        <StatsCard title="Pending to Pay" amount={stats.pendingToPay} icon="⏳" color="red" />
      </div>
      <TransactionList transactions={taken} emptyMessage="You haven't taken money from anyone yet." />
    </div>
  )
}