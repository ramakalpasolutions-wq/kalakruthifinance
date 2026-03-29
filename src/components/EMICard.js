'use client'

import { useState } from 'react'
import { useEmis } from '@/context/EMIContext'
import Link from 'next/link'

export default function EMICard({ emi, showActions = true }) {
  const { payEmi, deleteEmi } = useEmis()
  const [loading, setLoading] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)

  const loanTypeConfig = {
    home: { icon: '🏠', label: 'Home Loan', color: 'bg-emerald-100 text-emerald-700' },
    car: { icon: '🚗', label: 'Car Loan', color: 'bg-blue-100 text-blue-700' },
    personal: { icon: '👤', label: 'Personal Loan', color: 'bg-purple-100 text-purple-700' },
    education: { icon: '🎓', label: 'Education Loan', color: 'bg-amber-100 text-amber-700' },
    bike: { icon: '🏍️', label: 'Bike Loan', color: 'bg-orange-100 text-orange-700' },
    gold: { icon: '🥇', label: 'Gold Loan', color: 'bg-yellow-100 text-yellow-700' },
    business: { icon: '💼', label: 'Business Loan', color: 'bg-slate-100 text-slate-700' },
    other: { icon: '📄', label: 'Other', color: 'bg-gray-100 text-gray-700' }
  }

  const config = loanTypeConfig[emi.loanType] || loanTypeConfig.other

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const progress = emi.progress || Math.round((emi.emisPaid / emi.totalEmis) * 100)
  const remainingEmis = emi.remainingEmis || (emi.totalEmis - emi.emisPaid)
  const isCompleted = emi.status === 'completed'

  // Check if EMI is due
  const isDue = () => {
    if (!emi.nextEmiDate || isCompleted) return false
    const today = new Date()
    const nextDate = new Date(emi.nextEmiDate)
    return nextDate <= today
  }

  const handlePayEmi = async () => {
    setLoading(true)
    try {
      await payEmi(emi._id)
      setShowPayModal(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Delete this EMI? This will remove all payment history.')) {
      try {
        await deleteEmi(emi._id)
      } catch (error) {
        alert(error.message)
      }
    }
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 ${
        isCompleted 
          ? 'border-l-emerald-500' 
          : isDue() 
            ? 'border-l-rose-500' 
            : 'border-l-indigo-500'
      } overflow-hidden`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${config.color}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-lg ${isCompleted ? 'text-slate-400' : 'text-slate-800'}`}>
                  {emi.title}
                </h3>
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                    ✓ Completed
                  </span>
                )}
                {isDue() && !isCompleted && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">
                    Due Now!
                  </span>
                )}
              </div>

              {/* Lender & Account */}
              {emi.lenderName && (
                <p className="text-sm text-slate-500 mt-1">
                  🏦 {emi.lenderName}
                  {emi.loanAccountNumber && <span className="text-slate-400"> • A/C: {emi.loanAccountNumber}</span>}
                </p>
              )}

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
                {emi.interestRate > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    {emi.interestRate}% p.a.
                  </span>
                )}
              </div>

              {/* EMI Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    EMI {emi.emisPaid} of {emi.totalEmis} paid
                  </span>
                  <span className="font-medium text-slate-700">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* EMI Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500">Loan Amount</p>
                  <p className="font-semibold text-slate-800">₹{emi.loanAmount?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500">EMI Amount</p>
                  <p className="font-semibold text-indigo-600">₹{emi.emiAmount?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500">Remaining EMIs</p>
                  <p className="font-semibold text-amber-600">{remainingEmis}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-slate-500">Remaining Amount</p>
                  <p className="font-semibold text-rose-600">₹{(emi.remainingAmount || remainingEmis * emi.emiAmount)?.toLocaleString()}</p>
                </div>
              </div>

              {/* Next EMI Date */}
              {!isCompleted && emi.nextEmiDate && (
                <div className={`mt-3 p-3 rounded-lg ${isDue() ? 'bg-rose-50' : 'bg-sky-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span className={`text-sm font-medium ${isDue() ? 'text-rose-700' : 'text-sky-700'}`}>
                        Next EMI: {formatDate(emi.nextEmiDate)}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${isDue() ? 'text-rose-600' : 'text-sky-600'}`}>
                      ₹{emi.emiAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100">
              {!isCompleted && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                >
                  ✓ Pay EMI {emi.emisPaid + 1}
                </button>
              )}

              <Link
                href={`/dashboard/emi/${emi._id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                📊 View Details
              </Link>

              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pay EMI Modal */}
      {showPayModal && (
        <PayEMIModal
          emi={emi}
          onClose={() => setShowPayModal(false)}
          onSubmit={handlePayEmi}
          loading={loading}
        />
      )}
    </>
  )
}

// Pay EMI Modal
function PayEMIModal({ emi, onClose, onSubmit, loading }) {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [lateFee, setLateFee] = useState('')
  const [notes, setNotes] = useState('')

  const nextEmiNumber = emi.emisPaid + 1

  // Calculate due date
  const startDate = new Date(emi.startDate)
  const dueDate = new Date(startDate)
  dueDate.setMonth(dueDate.getMonth() + (nextEmiNumber - 1))
  dueDate.setDate(emi.emiDay)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      paidDate,
      lateFee: parseFloat(lateFee) || 0,
      paymentNotes: notes
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Pay EMI #{nextEmiNumber}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* EMI Info */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-medium text-indigo-800">{emi.title}</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>
                <span className="text-indigo-600">EMI Amount:</span>
                <span className="ml-1 font-bold">₹{emi.emiAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-indigo-600">Due Date:</span>
                <span className="ml-1 font-medium">{formatDate(dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Late Fee */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Late Fee (if any)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                value={lateFee}
                onChange={(e) => setLateFee(e.target.value)}
                className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Payment reference, etc."
            />
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">EMI Amount</span>
              <span className="font-medium">₹{emi.emiAmount.toLocaleString()}</span>
            </div>
            {lateFee && parseFloat(lateFee) > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-600">Late Fee</span>
                <span className="font-medium text-rose-600">₹{parseFloat(lateFee).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-200">
              <span className="font-medium text-slate-700">Total</span>
              <span className="font-bold text-indigo-600">
                ₹{(emi.emiAmount + (parseFloat(lateFee) || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : `✓ Confirm Payment`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}