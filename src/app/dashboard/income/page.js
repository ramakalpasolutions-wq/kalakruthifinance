'use client'

import { useTransactions } from '@/context/TransactionContext'
import TransactionList from '@/components/TransactionList'
import StatsCard from '@/components/StatsCard'

export default function IncomePage() {
  const { transactions, stats, loading } = useTransactions()
  const income = transactions.filter(t => t.type === 'income')

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Income</h1>
      <StatsCard title="Total Income" amount={stats.totalIncome} icon="💰" color="green" />
      <TransactionList transactions={income} emptyMessage="No income recorded yet." />
    </div>
  )
}