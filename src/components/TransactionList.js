'use client'

import TransactionCard from './TransactionCard'

export default function TransactionList({ transactions, emptyMessage }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-slate-500">{emptyMessage || 'No transactions found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction._id} transaction={transaction} />
      ))}
    </div>
  )
}