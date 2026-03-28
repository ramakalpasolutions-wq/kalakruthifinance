'use client'

import { useTransactions } from '@/context/TransactionContext'
import TransactionList from '@/components/TransactionList'
import StatsCard from '@/components/StatsCard'

export default function GivenPage() {
  const { transactions, stats, loading } = useTransactions()
  const given = transactions.filter(t => t.type === 'given')

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Money Given</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Total Given" amount={stats.totalGiven} icon="📤" color="red" />
        <StatsCard title="Pending to Receive" amount={stats.pendingToReceive} icon="⏳" color="orange" />
      </div>
      <TransactionList transactions={given} emptyMessage="You haven't given money to anyone yet." />
    </div>
  )
}