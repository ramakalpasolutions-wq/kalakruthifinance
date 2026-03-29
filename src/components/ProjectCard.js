'use client'

import { useState } from 'react'
import { useProjects } from '@/context/ProjectContext'

export default function ProjectCard({ project }) {
  const { updateProject, deleteProject, toggleStatus } = useProjects()
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const priorityConfig = {
    low: { color: 'bg-slate-100 text-slate-600', label: 'Low' },
    medium: { color: 'bg-sky-100 text-sky-700', label: 'Medium' },
    high: { color: 'bg-amber-100 text-amber-700', label: 'High' },
    urgent: { color: 'bg-rose-100 text-rose-700', label: 'Urgent' }
  }

  const statusConfig = {
    pending: { color: 'bg-slate-100 text-slate-600', label: 'Pending', border: 'border-l-slate-400' },
    'in-progress': { color: 'bg-sky-100 text-sky-700', label: 'In Progress', border: 'border-l-sky-500' },
    completed: { color: 'bg-emerald-100 text-emerald-700', label: 'Completed', border: 'border-l-emerald-500' }
  }

  const workTypeConfig = {
    photo: { icon: '📷', label: 'Photo', color: 'bg-purple-100 text-purple-700' },
    video: { icon: '🎬', label: 'Video', color: 'bg-pink-100 text-pink-700' },
    both: { icon: '📷🎬', label: 'Photo + Video', color: 'bg-indigo-100 text-indigo-700' }
  }

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed'
  const amountRemaining = (project.amount || 0) - (project.amountPaid || 0)
  const paymentProgress = project.amount > 0 ? ((project.amountPaid || 0) / project.amount) * 100 : 0

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleStatus(project._id, project.status)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      await updateProject(project._id, { status: newStatus })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Delete this project?')) {
      try {
        await deleteProject(project._id)
      } catch (error) {
        alert(error.message)
      }
    }
  }

  const handleAddPayment = async (amount) => {
    if (!amount || amount <= 0) return
    
    const newPaid = (project.amountPaid || 0) + amount
    let paymentStatus = 'unpaid'
    if (newPaid >= project.amount) {
      paymentStatus = 'paid'
    } else if (newPaid > 0) {
      paymentStatus = 'partial'
    }

    try {
      await updateProject(project._id, { 
        amountPaid: newPaid,
        paymentStatus
      })
      setShowPaymentModal(false)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleEditSubmit = async (updatedData) => {
    try {
      await updateProject(project._id, updatedData)
      setShowEditModal(false)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 ${statusConfig[project.status].border} overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                project.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 hover:border-indigo-500'
              }`}
            >
              {project.status === 'completed' && <span className="text-sm">✓</span>}
            </button>

            {/* Work Type Icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workTypeConfig[project.workType || 'photo'].color}`}>
              <span>{workTypeConfig[project.workType || 'photo'].icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold ${
                  project.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'
                }`}>
                  {project.title}
                </h3>
              </div>

              {/* Client Name */}
              {project.clientName && (
                <p className="text-sm text-slate-600 mt-1">
                  👤 {project.clientName}
                </p>
              )}

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${workTypeConfig[project.workType || 'photo'].color}`}>
                  {workTypeConfig[project.workType || 'photo'].label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[project.priority].color}`}>
                  {priorityConfig[project.priority].label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[project.status].color}`}>
                  {statusConfig[project.status].label}
                </span>
                {isOverdue && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">
                    Overdue
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  📁 {project.category}
                </span>
                {project.dueDate && (
                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-medium' : ''}`}>
                    📅 {formatDate(project.dueDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              {project.amount > 0 && (
                <>
                  <p className="text-xl font-bold text-slate-800">₹{project.amount.toLocaleString()}</p>
                  <p className={`text-sm ${amountRemaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {amountRemaining > 0 ? `Due: ₹${amountRemaining.toLocaleString()}` : 'Paid ✓'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Payment Progress */}
          {project.amount > 0 && (
            <div className="mt-4 ml-10">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Payment: ₹{(project.amountPaid || 0).toLocaleString()} / ₹{project.amount.toLocaleString()}</span>
                <span>{Math.round(paymentProgress)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    paymentProgress >= 100 ? 'bg-emerald-500' : paymentProgress > 0 ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Description Toggle */}
          {project.description && (
            <div className="mt-3 ml-10">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-indigo-600 text-sm hover:text-indigo-700"
              >
                {showDetails ? '▼ Hide details' : '▶ Show details'}
              </button>

              {showDetails && (
                <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {project.description}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 ml-10 flex items-center gap-2 pt-3 border-t border-slate-100">
            {project.status !== 'completed' && (
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}

            {/* Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              ✏️ Edit
            </button>

            {project.amount > 0 && amountRemaining > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
              >
                + Payment
              </button>
            )}

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
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          project={project}
          remaining={amountRemaining}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleAddPayment}
        />
      )}
    </>
  )
}

// Edit Project Modal Component
function EditProjectModal({ project, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    clientName: project.clientName || '',
    workType: project.workType || 'photo',
    amount: project.amount || '',
    amountPaid: project.amountPaid || '',
    priority: project.priority || 'medium',
    category: project.category || 'General',
    status: project.status || 'pending',
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
  })

  const categories = ['General', 'Wedding', 'Event', 'Corporate', 'Portrait', 'Product', 'Commercial', 'Personal', 'Other']

  const workTypes = [
    { value: 'photo', label: 'Photo', icon: '📷' },
    { value: 'video', label: 'Video', icon: '🎬' },
    { value: 'both', label: 'Both', icon: '📷🎬' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a project title')
      return
    }

    setLoading(true)
    
    // Calculate payment status
    const amount = parseFloat(formData.amount) || 0
    const amountPaid = parseFloat(formData.amountPaid) || 0
    let paymentStatus = 'unpaid'
    if (amount > 0) {
      if (amountPaid >= amount) {
        paymentStatus = 'paid'
      } else if (amountPaid > 0) {
        paymentStatus = 'partial'
      }
    }

    try {
      await onSubmit({
        ...formData,
        amount: amount,
        amountPaid: amountPaid,
        paymentStatus,
        dueDate: formData.dueDate || null
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Edit Project</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Project title"
              required
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Client name"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type of Work
            </label>
            <div className="grid grid-cols-3 gap-3">
              {workTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, workType: type.value })}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.workType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <p className="text-sm font-medium mt-1">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount Paid (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'pending', label: 'Pending', color: 'border-slate-400 bg-slate-50' },
                { value: 'in-progress', label: 'In Progress', color: 'border-sky-500 bg-sky-50' },
                { value: 'completed', label: 'Completed', color: 'border-emerald-500 bg-emerald-50' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value })}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.status === option.value
                      ? option.color
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'low', label: 'Low', color: 'border-slate-400 bg-slate-50', icon: '🟢' },
                { value: 'medium', label: 'Medium', color: 'border-sky-500 bg-sky-50', icon: '🔵' },
                { value: 'high', label: 'High', color: 'border-amber-500 bg-amber-50', icon: '🟠' },
                { value: 'urgent', label: 'Urgent', color: 'border-rose-500 bg-rose-50', icon: '🔴' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: option.value })}
                  className={`p-2 rounded-lg border-2 text-center transition ${
                    formData.priority === option.value
                      ? option.color
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{option.icon}</span>
                  <p className="text-xs font-medium mt-1">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Details / Notes
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              placeholder="Add details..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
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

// Payment Modal Component
function PaymentModal({ project, remaining, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const paymentAmount = parseFloat(amount)
    
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (paymentAmount > remaining) {
      alert(`Amount cannot exceed ₹${remaining}`)
      return
    }

    setLoading(true)
    await onSubmit(paymentAmount)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Add Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Project</span>
            <span className="font-medium text-slate-800">{project.title}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Total Amount</span>
            <span className="font-medium text-slate-800">₹{project.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Already Paid</span>
            <span className="font-medium text-emerald-600">₹{(project.amountPaid || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Remaining</span>
            <span className="font-semibold text-rose-600">₹{remaining.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(remaining.toString())}
              className="text-sm text-indigo-600 mt-2 hover:text-indigo-700"
            >
              Pay full amount (₹{remaining.toLocaleString()})
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Payment'}
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