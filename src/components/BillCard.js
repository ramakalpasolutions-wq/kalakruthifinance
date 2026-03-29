'use client'

import { useState } from 'react'
import { useBills } from '@/context/BillContext'

export default function BillCard({ bill }) {
  const { updateBill, deleteBill, markAsPaid } = useBills()
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const categoryConfig = {
    'Electricity': { icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
    'Internet': { icon: '🌐', color: 'bg-blue-100 text-blue-700' },
    'Phone': { icon: '📱', color: 'bg-purple-100 text-purple-700' },
    'Rent': { icon: '🏠', color: 'bg-green-100 text-green-700' },
    'Water': { icon: '💧', color: 'bg-cyan-100 text-cyan-700' },
    'Gas': { icon: '🔥', color: 'bg-orange-100 text-orange-700' },
    'Insurance': { icon: '🛡️', color: 'bg-indigo-100 text-indigo-700' },
    'Subscription': { icon: '📺', color: 'bg-pink-100 text-pink-700' },
    'EMI': { icon: '🏦', color: 'bg-slate-100 text-slate-700' },
    'Credit Card': { icon: '💳', color: 'bg-red-100 text-red-700' },
    'Other': { icon: '📄', color: 'bg-gray-100 text-gray-700' }
  }

  const frequencyLabels = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    custom: 'Custom'
  }

  const config = categoryConfig[bill.category] || categoryConfig['Other']

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getDaysUntilDue = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(bill.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysUntilDue = getDaysUntilDue()
  const isOverdue = daysUntilDue < 0 && bill.status !== 'paid'
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3 && bill.status !== 'paid'

  const handleMarkPaid = async () => {
    if (bill.isRecurring) {
      const createNext = confirm('This is a recurring bill. Create next bill automatically?')
      setLoading(true)
      try {
        await markAsPaid(bill._id, createNext)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        await markAsPaid(bill._id, false)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDelete = async () => {
    if (confirm('Delete this bill?')) {
      try {
        await deleteBill(bill._id)
      } catch (error) {
        alert(error.message)
      }
    }
  }

  const handleEditSubmit = async (updatedData) => {
    try {
      await updateBill(bill._id, updatedData)
      setShowEditModal(false)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 ${
        bill.status === 'paid' 
          ? 'border-l-emerald-500' 
          : isOverdue 
            ? 'border-l-rose-500' 
            : isDueSoon 
              ? 'border-l-amber-500' 
              : 'border-l-sky-500'
      } overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${config.color}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold ${
                  bill.status === 'paid' ? 'text-slate-400 line-through' : 'text-slate-800'
                }`}>
                  {bill.title}
                </h3>
                {bill.isRecurring && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    🔄 {frequencyLabels[bill.frequency]}
                  </span>
                )}
                {bill.autopay && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                    Auto-pay
                  </span>
                )}
              </div>

              {/* Status Tags */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                  {bill.category}
                </span>
                {bill.status === 'paid' && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                    ✓ Paid
                  </span>
                )}
                {isOverdue && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">
                    Overdue by {Math.abs(daysUntilDue)} days
                  </span>
                )}
                {isDueSoon && !isOverdue && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                    Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-medium' : ''}`}>
                  📅 Due: {formatDate(bill.dueDate)}
                </span>
                {bill.paidDate && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    ✓ Paid: {formatDate(bill.paidDate)}
                  </span>
                )}
              </div>

              {/* Notes */}
              {bill.notes && (
                <p className="mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded">
                  {bill.notes}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                bill.status === 'paid' ? 'text-emerald-600' : isOverdue ? 'text-rose-600' : 'text-slate-800'
              }`}>
                ₹{bill.amount.toLocaleString()}
              </p>
              {daysUntilDue === 0 && bill.status !== 'paid' && (
                <p className="text-sm font-medium text-amber-600">Due Today!</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
            {bill.status !== 'paid' && (
              <button
                onClick={handleMarkPaid}
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Marking...' : '✓ Mark Paid'}
              </button>
            )}

            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              ✏️ Edit
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditBillModal
          bill={bill}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  )
}

// Edit Bill Modal
function EditBillModal({ bill, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: bill.title || '',
    amount: bill.amount || '',
    category: bill.category || 'Other',
    dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
    isRecurring: bill.isRecurring || false,
    frequency: bill.frequency || 'monthly',
    customDays: bill.customDays || '',
    reminderDays: bill.reminderDays || 3,
    notes: bill.notes || '',
    autopay: bill.autopay || false
  })

  const categories = [
    'Electricity', 'Internet', 'Phone', 'Rent', 'Water', 'Gas', 
    'Insurance', 'Subscription', 'EMI', 'Credit Card', 'Other'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        amount: Number(formData.amount) || 0,
        customDays: formData.customDays ? Number(formData.customDays) : null,
        reminderDays: Number(formData.reminderDays) || 3
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Edit Bill</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bill Name *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-slate-700">
              This is a recurring bill
            </label>
          </div>

          {/* Frequency (if recurring) */}
          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          )}

          {/* Auto-pay Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="autopay"
              checked={formData.autopay}
              onChange={(e) => setFormData({ ...formData, autopay: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
            <label htmlFor="autopay" className="text-sm font-medium text-slate-700">
              Auto-pay enabled
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="2"
              placeholder="Add notes..."
            />
          </div>
        </form>

        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}