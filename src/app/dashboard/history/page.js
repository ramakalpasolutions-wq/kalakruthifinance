'use client'

import { useState } from 'react'
import { useTransactions } from '@/context/TransactionContext'
import TransactionList from '@/components/TransactionList'

export default function HistoryPage() {
  const { transactions, loading } = useTransactions()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = transactions.filter(t => {
    const matchesType = filter === 'all' || t.type === filter
    const matchesSearch = search === '' ||
      t.person?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">All History</h1>

      <div className="bg-white text-black rounded-xl shadow-md p-4">
        <div className="flex text-black flex-col md:flex-row gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="given">Given</option>
            <option value="taken">Taken</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <p className="text-gray-600">Showing {filtered.length} of {transactions.length} transactions</p>

      <TransactionList transactions={filtered} emptyMessage="No transactions found." />
    </div>
  )
}