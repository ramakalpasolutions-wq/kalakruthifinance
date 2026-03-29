'use client'

import { useState, useEffect } from 'react'
import { useEmis } from '@/context/EMIContext'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EMIDetailPage() {
  const { getEmiDetails, payEmi, updateEmi } = useEmis()
  const params = useParams()
  const router = useRouter()
  const [emi, setEmi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadEmiDetails()
  }, [params.id])

  const loadEmiDetails = async () => {
    try {
      setLoading(true)
      const data = await getEmiDetails(params.id)
      setEmi(data)
    } catch (error) {
      console.error('Error loading EMI:', error)
      alert('EMI not found')
      router.push('/dashboard/emi')
    } finally {
      setLoading(false)
    }
  }

  const handlePayEmi = async () => {
    setPaying(true)
    try {
      await payEmi(emi._id)
      await loadEmiDetails()
    } catch (error) {
      alert(error.message)
    } finally {
      setPaying(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!emi) return null

  const config = loanTypeConfig[emi.loanType] || loanTypeConfig.other
  const progress = emi.progress || Math.round((emi.emisPaid / emi.totalEmis) * 100)
  const isCompleted = emi.status === 'completed'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/dashboard/emi"
            className="text-indigo-600 text-sm font-medium hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to EMIs
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{emi.title}</h1>
          {emi.lenderName && (
            <p className="text-slate-500 mt-1">🏦 {emi.lenderName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
          >
            ✏️ Edit
          </button>
          {!isCompleted && (
            <button
              onClick={handlePayEmi}
              disabled={paying}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50"
            >
              {paying ? 'Processing...' : `✓ Pay EMI ${emi.emisPaid + 1}`}
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🎉</span>
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Loan Completed!</p>
            <p className="text-sm text-emerald-600">Completed on {formatDate(emi.completedAt)}</p>
          </div>
        </div>
      )}

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loan Details */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500">{config.label}</p>
              <p className="font-bold text-xl text-slate-800">₹{emi.loanAmount?.toLocaleString()}</p>
            </div>
          </div>
          {emi.interestRate > 0 && (
            <p className="text-sm text-slate-500">Interest Rate: {emi.interestRate}% p.a.</p>
          )}
          {emi.loanAccountNumber && (
            <p className="text-sm text-slate-500">A/C: {emi.loanAccountNumber}</p>
          )}
        </div>

        {/* EMI Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-2">EMI Progress</p>
          <p className="font-bold text-2xl text-indigo-600 mb-2">
            {emi.emisPaid} / {emi.totalEmis}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">
            {emi.totalEmis - emi.emisPaid} EMIs remaining
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-2">Monthly EMI</p>
          <p className="font-bold text-2xl text-slate-800 mb-3">₹{emi.emiAmount?.toLocaleString()}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Paid</span>
              <span className="font-medium text-emerald-600">₹{emi.totalPaidAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining</span>
              <span className="font-medium text-rose-600">₹{emi.remainingAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next EMI Alert */}
      {!isCompleted && emi.nextEmiDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-semibold text-amber-800">Next EMI Due</p>
                <p className="text-sm text-amber-600">{formatDate(emi.nextEmiDate)}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700">₹{emi.emiAmount?.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* EMI Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">EMI Schedule</h2>
          <p className="text-sm text-slate-500">Complete payment timeline</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">EMI #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emi.schedule?.map((item, idx) => {
                const isPaid = item.status === 'paid'
                const isNext = !isPaid && idx === emi.emisPaid
                const isOverdue = !isPaid && new Date(item.dueDate) < new Date()

                return (
                  <tr 
                    key={idx} 
                    className={`${isNext ? 'bg-amber-50' : ''} ${isPaid ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        isPaid 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isNext 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.emiNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={isOverdue && !isPaid ? 'text-rose-600 font-medium' : 'text-slate-700'}>
                        {formatDate(item.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      ₹{item.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {isPaid ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          ✓ Paid
                        </span>
                      ) : isOverdue ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700">
                          Overdue
                        </span>
                      ) : isNext ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          Due Now
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          Upcoming
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.paidDate ? formatDate(item.paidDate) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {emi.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-2">Notes</h3>
          <p className="text-slate-600">{emi.notes}</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditEMIModal
          emi={emi}
          onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            await updateEmi(emi._id, data)
            await loadEmiDetails()
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}

// Edit EMI Modal
function EditEMIModal({ emi, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: emi.title,
    lenderName: emi.lenderName || '',
    loanAccountNumber: emi.loanAccountNumber || '',
    interestRate: emi.interestRate || '',
    notes: emi.notes || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Edit EMI</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lender Name</label>
            <input
              type="text"
              value={formData.lenderName}
              onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
            <input
              type="text"
              value={formData.loanAccountNumber}
              onChange={(e) => setFormData({ ...formData, loanAccountNumber: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
              rows="2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
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