'use client'

import { useState } from 'react'
import { useEmis } from '@/context/EMIContext'
import { useRouter } from 'next/navigation'

export default function AddEMIPage() {
  const { addEmi } = useEmis()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    loanType: 'personal',
    lenderName: '',
    loanAccountNumber: '',
    loanAmount: '',
    interestRate: '',
    emiAmount: '',
    totalEmis: '',
    emisPaid: '0',
    startDate: '',
    emiDay: '1',
    notes: ''
  })

  const loanTypes = [
    { value: 'home', label: 'Home Loan', icon: '🏠' },
    { value: 'car', label: 'Car Loan', icon: '🚗' },
    { value: 'personal', label: 'Personal Loan', icon: '👤' },
    { value: 'education', label: 'Education Loan', icon: '🎓' },
    { value: 'bike', label: 'Bike Loan', icon: '🏍️' },
    { value: 'gold', label: 'Gold Loan', icon: '🥇' },
    { value: 'business', label: 'Business Loan', icon: '💼' },
    { value: 'other', label: 'Other', icon: '📄' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter EMI title')
      return
    }
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      alert('Please enter valid loan amount')
      return
    }
    if (!formData.emiAmount || parseFloat(formData.emiAmount) <= 0) {
      alert('Please enter valid EMI amount')
      return
    }
    if (!formData.totalEmis || parseInt(formData.totalEmis) < 1) {
      alert('Please enter valid number of EMIs')
      return
    }
    if (!formData.startDate) {
      alert('Please select start date')
      return
    }

    setLoading(true)

    try {
      const emiData = {
        title: formData.title.trim(),
        loanType: formData.loanType,
        lenderName: formData.lenderName.trim(),
        loanAccountNumber: formData.loanAccountNumber.trim(),
        loanAmount: parseFloat(formData.loanAmount),
        interestRate: parseFloat(formData.interestRate) || 0,
        emiAmount: parseFloat(formData.emiAmount),
        totalEmis: parseInt(formData.totalEmis),
        emisPaid: parseInt(formData.emisPaid) || 0,
        startDate: formData.startDate,
        emiDay: parseInt(formData.emiDay) || 1,
        notes: formData.notes.trim()
      }

      console.log('Adding EMI:', emiData)

      await addEmi(emiData)
      alert('EMI added successfully!')
      router.push('/dashboard/emi')
    } catch (error) {
      console.error('Error adding EMI:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate end date preview
  const getEndDate = () => {
    if (!formData.startDate || !formData.totalEmis) return null
    const start = new Date(formData.startDate)
    start.setMonth(start.getMonth() + parseInt(formData.totalEmis) - 1)
    return start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New EMI</h1>
        <p className="text-slate-500 text-sm mt-1">Track a new loan EMI</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* EMI Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              EMI Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Home Loan - SBI"
              required
            />
          </div>

          {/* Loan Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Loan Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {loanTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, loanType: type.value })}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.loanType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <p className="text-xs font-medium mt-1">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Lender Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lender / Bank Name
              </label>
              <input
                type="text"
                value={formData.lenderName}
                onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., SBI, HDFC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loan Account Number
              </label>
              <input
                type="text"
                value={formData.loanAccountNumber}
                onChange={(e) => setFormData({ ...formData, loanAccountNumber: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Loan & Interest */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loan Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="500000"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Interest Rate (% p.a.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full p-3 pr-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="10.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* EMI Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                EMI Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={formData.emiAmount}
                  onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="15000"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total EMIs *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalEmis}
                onChange={(e) => setFormData({ ...formData, totalEmis: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="36"
                required
              />
            </div>
          </div>

          {/* Start Date & EMI Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                EMI Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                EMI Due Day (of month)
              </label>
              <select
                value={formData.emiDay}
                onChange={(e) => setFormData({ ...formData, emiDay: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Already Paid EMIs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              EMIs Already Paid
            </label>
            <input
              type="number"
              min="0"
              value={formData.emisPaid}
              onChange={(e) => setFormData({ ...formData, emisPaid: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1">
              If you've already paid some EMIs, enter the count here
            </p>
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
              rows="2"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Preview */}
          {formData.emiAmount && formData.totalEmis && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-3">EMI Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-indigo-500">Total EMIs</p>
                  <p className="font-bold text-indigo-700">{formData.totalEmis}</p>
                </div>
                <div>
                  <p className="text-indigo-500">Monthly EMI</p>
                  <p className="font-bold text-indigo-700">₹{parseFloat(formData.emiAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-indigo-500">Total Payment</p>
                  <p className="font-bold text-indigo-700">
                    ₹{(parseFloat(formData.emiAmount || 0) * parseInt(formData.totalEmis || 0)).toLocaleString()}
                  </p>
                </div>
                {getEndDate() && (
                  <div>
                    <p className="text-indigo-500">End Date</p>
                    <p className="font-bold text-indigo-700">{getEndDate()}</p>
                  </div>
                )}
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
              {loading ? 'Adding...' : 'Add EMI'}
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