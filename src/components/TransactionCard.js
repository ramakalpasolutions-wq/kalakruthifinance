'use client'

import { useState } from 'react'
import { useTransactions } from '@/context/TransactionContext'
import PaymentModal from './PaymentModal'

export default function TransactionCard({ transaction }) {
  const { deleteTransaction, addPayment } = useTransactions()
  const [showPayments, setShowPayments] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const totalPaid = transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const remaining = transaction.amount - totalPaid
  const progress = (totalPaid / transaction.amount) * 100

  const config = {
    given: { border: 'border-l-rose-500', badge: 'bg-rose-50 text-rose-700', label: 'Given', progress: 'bg-rose-500' },
    taken: { border: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-700', label: 'Taken', progress: 'bg-amber-500' },
    income: { border: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700', label: 'Income', progress: 'bg-emerald-500' },
    expense: { border: 'border-l-indigo-500', badge: 'bg-indigo-50 text-indigo-700', label: 'Expense', progress: 'bg-indigo-500' }
  }[transaction.type]

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const handleDelete = async () => {
    if (confirm('Delete this transaction?')) {
      try {
        await deleteTransaction(transaction._id)
      } catch (error) {
        alert(error.message)
      }
    }
  }

  const handleAddPayment = async (paymentData) => {
    try {
      await addPayment(transaction._id, paymentData)
      setShowPaymentModal(false)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 ${config.border} p-5 hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${config.badge}`}>
                {config.label}
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                {transaction.category}
              </span>
              {transaction.status === 'completed' && (
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                  Completed
                </span>
              )}
              {transaction.status === 'partial' && (
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700">
                  Partial
                </span>
              )}
              {transaction.status === 'pending' && ['given', 'taken'].includes(transaction.type) && (
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                  Pending
                </span>
              )}
            </div>

            {/* Person & Date */}
            {transaction.person && (
              <h3 className="text-lg font-semibold text-slate-800">{transaction.person}</h3>
            )}
            <p className="text-sm text-slate-500 mt-1">{formatDate(transaction.date)}</p>
            {transaction.description && (
              <p className="text-sm text-slate-600 mt-2 bg-slate-50 px-3 py-2 rounded">{transaction.description}</p>
            )}
          </div>

          {/* Amount */}
          <div className="text-right ml-4">
            <p className="text-2xl font-bold text-slate-800">₹{transaction.amount.toLocaleString()}</p>
            {['given', 'taken'].includes(transaction.type) && totalPaid > 0 && (
              <div className="text-sm mt-2 space-y-1">
                <p className="text-emerald-600">Paid: ₹{totalPaid.toLocaleString()}</p>
                <p className={`font-semibold ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  Due: ₹{remaining.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {['given', 'taken'].includes(transaction.type) && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{Math.round(progress)}% Complete</span>
              <span>₹{totalPaid.toLocaleString()} / ₹{transaction.amount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`${config.progress} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Payment History */}
        {transaction.payments?.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowPayments(!showPayments)}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1"
            >
              <span className="text-xs">{showPayments ? '▼' : '▶'}</span>
              Payment History ({transaction.payments.length})
            </button>

            {showPayments && (
              <div className="mt-3 bg-slate-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Amount</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transaction.payments.map((payment, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-emerald-600 font-medium">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-slate-500">{formatDate(payment.date)}</td>
                        <td className="px-3 py-2 text-slate-500">{payment.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
          {['given', 'taken'].includes(transaction.type) && transaction.status !== 'completed' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              + Add Payment
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          transaction={transaction}
          remaining={remaining}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleAddPayment}
        />
      )}
    </>
  )
}