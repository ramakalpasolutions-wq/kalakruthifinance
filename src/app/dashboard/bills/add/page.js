'use client'

import { useState } from 'react'
import { useBills } from '@/context/BillContext'
import { useRouter } from 'next/navigation'

export default function AddBillPage() {
  const { addBill } = useBills()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Other',
    dueDate: '',
    isRecurring: false,
    frequency: 'monthly',
    customDays: '',
    reminderDays: 3,
    notes: '',
    autopay: false
  })

  const categories = [
    { value: 'Electricity', icon: '⚡' },
    { value: 'Internet', icon: '🌐' },
    { value: 'Phone', icon: '📱' },
    { value: 'Rent', icon: '🏠' },
    { value: 'Water', icon: '💧' },
    { value: 'Gas', icon: '🔥' },
    { value: 'Insurance', icon: '🛡️' },
    { value: 'Subscription', icon: '📺' },
    { value: 'EMI', icon: '🏦' },
    { value: 'Credit Card', icon: '💳' },
    { value: 'Other', icon: '📄' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a bill name')
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    if (!formData.dueDate) {
      alert('Please select a due date')
      return
    }

    setLoading(true)

    try {
      const billData = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        dueDate: formData.dueDate,
        isRecurring: formData.isRecurring,
        frequency: formData.frequency,
        customDays: formData.customDays ? parseInt(formData.customDays) : null,
        reminderDays: parseInt(formData.reminderDays) || 3,
        notes: formData.notes.trim(),
        autopay: formData.autopay
      }

      console.log('Adding bill:', billData)

      await addBill(billData)
      alert('Bill added successfully!')
      router.push('/dashboard/bills')
    } catch (error) {
      console.error('Error adding bill:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New Bill</h1>
        <p className="text-slate-500 text-sm mt-1">Set up a new bill or recurring payment</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Bill Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bill Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Electricity Bill"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Category
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.category === cat.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <p className="text-xs font-medium mt-1 truncate">{cat.value}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isRecurring" className="font-medium text-slate-700">
                🔄 This is a recurring bill
              </label>
            </div>

            {/* Frequency (shown if recurring) */}
            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'yearly', label: 'Yearly' }
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: freq.value })}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition ${
                        formData.frequency === freq.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-pay Toggle */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
            <input
              type="checkbox"
              id="autopay"
              checked={formData.autopay}
              onChange={(e) => setFormData({ ...formData, autopay: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="autopay" className="font-medium text-emerald-700">
              ✓ Auto-pay enabled (for reference only)
            </label>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Remind me before (days)
            </label>
            <select
              value={formData.reminderDays}
              onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">1 day before</option>
              <option value="3">3 days before</option>
              <option value="5">5 days before</option>
              <option value="7">1 week before</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="3"
              placeholder="Add any notes about this bill..."
            />
          </div>

          {/* Preview */}
          {formData.title && formData.amount && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">
                  {categories.find(c => c.value === formData.category)?.icon || '📄'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{formData.title}</h3>
                  <p className="text-sm text-slate-500">
                    {formData.category}
                    {formData.isRecurring && ` • ${formData.frequency}`}
                  </p>
                </div>
                <p className="text-xl font-bold text-slate-800">
                  ₹{parseFloat(formData.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Bill'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}