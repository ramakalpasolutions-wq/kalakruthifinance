'use client'

import { useState } from 'react'
import { useTransactions } from '@/context/TransactionContext'
import { useRouter } from 'next/navigation'

export default function TransactionForm() {
  const { addTransaction } = useTransactions()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'given',
    person: '',
    amount: '',
    category: 'Personal',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const categories = {
    given: ['Personal', 'Family', 'Friend', 'Business', 'Other'],
    taken: ['Personal', 'Family', 'Friend', 'Business', 'Loan', 'Other'],
    income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
  }

  const typeConfig = {
    given: { label: 'Money Given', desc: 'You gave money to someone', border: 'border-rose-500 bg-rose-50' },
    taken: { label: 'Money Taken', desc: 'You borrowed money from someone', border: 'border-amber-500 bg-amber-50' },
    income: { label: 'Income', desc: 'Money you earned or received', border: 'border-emerald-500 bg-emerald-50' },
    expense: { label: 'Expense', desc: 'Money you spent', border: 'border-indigo-500 bg-indigo-50' }
  }

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category: categories[type][0]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (['given', 'taken'].includes(formData.type) && !formData.person) {
      alert('Please enter person name')
      return
    }

    setLoading(true)
    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      })

      alert('Transaction added successfully!')
      router.push('/dashboard')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Transaction Type</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                formData.type === type 
                  ? config.border 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <p className="font-semibold text-slate-800">{config.label}</p>
              <p className="text-xs text-slate-500 mt-1">{config.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Person Name */}
      {['given', 'taken'].includes(formData.type) && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Person Name</label>
          <input
            type="text"
            value={formData.person}
            onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            className="w-full p-3 border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter person's name"
            required
          />
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full p-3 pl-8 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Category & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-3 border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories[formData.type].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 text-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows="3"
          placeholder="Add notes..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  )
}