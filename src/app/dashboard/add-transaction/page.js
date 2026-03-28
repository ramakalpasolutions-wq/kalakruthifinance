'use client'

import TransactionForm from '@/components/TransactionForm'

export default function AddTransactionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-6">Add Transaction</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <TransactionForm />
      </div>
    </div>
  )
}