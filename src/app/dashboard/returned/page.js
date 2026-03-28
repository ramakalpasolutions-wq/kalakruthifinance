'use client'

import { useTransactions } from '@/context/TransactionContext'

export default function ReturnedPage() {
  const { transactions, loading } = useTransactions()

  const returned = transactions
    .filter(t => t.type === 'taken' && t.payments.length > 0)
    .flatMap(t => t.payments.map(p => ({ ...p, person: t.person })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalReturned = returned.reduce((sum, p) => sum + p.amount, 0)

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Payments Returned</h1>
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
        <p className="text-sm opacity-90">Total Returned</p>
        <p className="text-3xl font-bold mt-2">₹{totalReturned.toLocaleString()}</p>
      </div>

      {returned.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          <p className="text-4xl mb-4">📭</p>
          <p>No payments returned yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returned.map((payment, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{payment.person}</td>
                  <td className="px-6 py-4 text-blue-600 font-semibold">-₹{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(payment.date)}</td>
                  <td className="px-6 py-4 text-gray-500">{payment.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}