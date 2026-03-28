'use client'

import { useTransactions } from '@/context/TransactionContext'
import TransactionList from '@/components/TransactionList'
import StatsCard from '@/components/StatsCard'

export default function ExpensesPage() {
  const { transactions, stats, loading } = useTransactions()
  const expenses = transactions.filter(t => t.type === 'expense')

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
      <StatsCard title="Total Expenses" amount={stats.totalExpenses} icon="💸" color="purple" />
      <TransactionList transactions={expenses} emptyMessage="No expenses recorded yet." />
    </div>
  )
}