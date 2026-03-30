'use client'

import { useState } from 'react'
import { useProjects } from '@/context/ProjectContext'

export default function ProjectCard({ project }) {
  const { updateProject, deleteProject, toggleStatus } = useProjects()
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSelectionModal, setShowSelectionModal] = useState(false)

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

  // Selection Status Helper
  const getSelectionStatus = () => {
    if (project.imagesDelivered) {
      return { status: 'delivered', label: 'Delivered', color: 'bg-emerald-500 text-white', icon: '🎉' }
    }
    if (project.imagesSelected) {
      return { status: 'selected', label: 'Selected', color: 'bg-emerald-100 text-emerald-700', icon: '✅' }
    }
    if (project.imagesSent) {
      return { status: 'sent', label: 'Pending Selection', color: 'bg-amber-100 text-amber-700', icon: '⏳' }
    }
    return { status: 'not-sent', label: 'Not Sent', color: 'bg-slate-100 text-slate-600', icon: '📤' }
  }

  const selectionStatus = getSelectionStatus()

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
    } else if (project.advanceAmount > 0 && newPaid > project.advanceAmount) {
      paymentStatus = 'partial'
    } else if (project.advanceAmount > 0) {
      paymentStatus = 'advance'
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

  const handleSelectionUpdate = async (selectionData) => {
    try {
      await updateProject(project._id, selectionData)
      setShowSelectionModal(false)
    } catch (error) {
      alert(error.message)
    }
  }

  // Quick toggle for selection
  const handleQuickSelectionToggle = async (field) => {
    try {
      const updates = {}
      if (field === 'imagesSent') {
        updates.imagesSent = !project.imagesSent
        if (!project.imagesSent) {
          updates.imagesSentDate = new Date()
        }
      } else if (field === 'imagesSelected') {
        updates.imagesSelected = !project.imagesSelected
        if (!project.imagesSelected) {
          updates.imagesSelectedDate = new Date()
        }
      } else if (field === 'imagesDelivered') {
        updates.imagesDelivered = !project.imagesDelivered
        if (!project.imagesDelivered) {
          updates.imagesDeliveredDate = new Date()
        }
      }
      await updateProject(project._id, updates)
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

              {/* Location */}
              {project.location && (
                <p className="text-sm text-slate-600 mt-1">
                  📍 {project.location}
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
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  📁 {project.category}
                </span>
                {project.eventDate && (
                  <span className="flex items-center gap-1">
                    📅 {formatDate(project.eventDate)}
                  </span>
                )}
                {project.dueDate && (
                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-medium' : ''}`}>
                    ⏰ Due: {formatDate(project.dueDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              {project.amount > 0 && (
                <>
                  <p className="text-xl font-bold text-slate-800">₹{project.amount.toLocaleString()}</p>
                  {project.advanceAmount > 0 && (
                    <p className="text-xs text-emerald-600 font-medium">
                      Adv: ₹{project.advanceAmount.toLocaleString()}
                    </p>
                  )}
                  <p className={`text-sm ${amountRemaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {amountRemaining > 0 ? `Due: ₹${amountRemaining.toLocaleString()}` : 'Paid ✓'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ===== IMAGE SELECTION STATUS SECTION ===== */}
          <div className="mt-4 ml-10 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                🖼️ Image Selection Status
              </h4>
              <button
                onClick={() => setShowSelectionModal(true)}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Edit Details →
              </button>
            </div>

            {/* Selection Progress Steps */}
            <div className="flex items-center gap-2">
              {/* Step 1: Images Sent */}
              <button
                onClick={() => handleQuickSelectionToggle('imagesSent')}
                className={`flex-1 p-2 rounded-lg border-2 transition text-center ${
                  project.imagesSent 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  project.imagesSent ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {project.imagesSent ? '✓' : '1'}
                </div>
                <p className="text-xs font-medium text-slate-700">Sent</p>
                {project.imagesSent && project.totalImagesSent > 0 && (
                  <p className="text-xs text-slate-500">{project.totalImagesSent} images</p>
                )}
              </button>

              {/* Arrow */}
              <span className="text-slate-300">→</span>

              {/* Step 2: Client Selected */}
              <button
                onClick={() => handleQuickSelectionToggle('imagesSelected')}
                disabled={!project.imagesSent}
                className={`flex-1 p-2 rounded-lg border-2 transition text-center ${
                  project.imagesSelected 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : project.imagesSent
                      ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
                      : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  project.imagesSelected 
                    ? 'bg-emerald-500 text-white' 
                    : project.imagesSent 
                      ? 'bg-amber-400 text-white animate-pulse' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {project.imagesSelected ? '✓' : '2'}
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {project.imagesSelected ? 'Selected' : 'Selection'}
                </p>
                {project.imagesSelected && project.selectedImagesCount > 0 && (
                  <p className="text-xs text-slate-500">{project.selectedImagesCount} selected</p>
                )}
              </button>

              {/* Arrow */}
              <span className="text-slate-300">→</span>

              {/* Step 3: Delivered */}
              <button
                onClick={() => handleQuickSelectionToggle('imagesDelivered')}
                disabled={!project.imagesSelected}
                className={`flex-1 p-2 rounded-lg border-2 transition text-center ${
                  project.imagesDelivered 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : project.imagesSelected
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  project.imagesDelivered 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {project.imagesDelivered ? '✓' : '3'}
                </div>
                <p className="text-xs font-medium text-slate-700">Delivered</p>
              </button>
            </div>

            {/* Current Status Summary */}
            <div className={`mt-2 px-3 py-1.5 rounded-full text-center ${selectionStatus.color}`}>
              <span className="text-sm font-medium">
                {selectionStatus.icon} {selectionStatus.label}
                {project.imagesSelected && project.selectedImagesCount > 0 && (
                  <span className="ml-1">({project.selectedImagesCount}/{project.totalImagesSent || '?'})</span>
                )}
              </span>
            </div>
          </div>
          {/* ===== END IMAGE SELECTION STATUS ===== */}

          {/* Payment Progress */}
          {project.amount > 0 && (
            <div className="mt-4 ml-10">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>
                  Payment: ₹{(project.amountPaid || 0).toLocaleString()} / ₹{project.amount.toLocaleString()}
                  {project.advanceAmount > 0 && (
                    <span className="text-emerald-600 ml-1">(incl. advance)</span>
                  )}
                </span>
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
          <div className="mt-4 ml-10 flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
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

      {/* Selection Modal */}
      {showSelectionModal && (
        <SelectionModal
          project={project}
          onClose={() => setShowSelectionModal(false)}
          onSubmit={handleSelectionUpdate}
        />
      )}
    </>
  )
}

// ===== SELECTION MODAL =====
function SelectionModal({ project, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    imagesSent: project.imagesSent || false,
    imagesSentDate: project.imagesSentDate ? new Date(project.imagesSentDate).toISOString().split('T')[0] : '',
    totalImagesSent: project.totalImagesSent || '',
    imagesSelected: project.imagesSelected || false,
    imagesSelectedDate: project.imagesSelectedDate ? new Date(project.imagesSelectedDate).toISOString().split('T')[0] : '',
    selectedImagesCount: project.selectedImagesCount || '',
    imagesDelivered: project.imagesDelivered || false,
    imagesDeliveredDate: project.imagesDeliveredDate ? new Date(project.imagesDeliveredDate).toISOString().split('T')[0] : '',
    selectionNotes: project.selectionNotes || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        imagesSent: formData.imagesSent,
        imagesSentDate: formData.imagesSentDate || null,
        totalImagesSent: parseInt(formData.totalImagesSent) || 0,
        imagesSelected: formData.imagesSelected,
        imagesSelectedDate: formData.imagesSelectedDate || null,
        selectedImagesCount: parseInt(formData.selectedImagesCount) || 0,
        imagesDelivered: formData.imagesDelivered,
        imagesDeliveredDate: formData.imagesDeliveredDate || null,
        selectionNotes: formData.selectionNotes
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
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
          <h3 className="text-xl font-semibold text-purple-800">🖼️ Image Selection Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="font-medium text-slate-800">{project.title}</p>
            {project.location && <p className="text-sm text-slate-500">📍 {project.location}</p>}
          </div>

          {/* Step 1: Images Sent */}
          <div className={`p-4 rounded-lg border-2 ${formData.imagesSent ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formData.imagesSent ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {formData.imagesSent ? '✓' : '1'}
                </div>
                <div>
                  <p className="font-medium text-slate-800">Images Sent to Client</p>
                  <p className="text-xs text-slate-500">Have you sent images for selection?</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.imagesSent}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    imagesSent: e.target.checked,
                    imagesSentDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            {formData.imagesSent && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date Sent</label>
                  <input
                    type="date"
                    value={formData.imagesSentDate}
                    onChange={(e) => setFormData({ ...formData, imagesSentDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total Images Sent</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalImagesSent}
                    onChange={(e) => setFormData({ ...formData, totalImagesSent: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Images Selected */}
          <div className={`p-4 rounded-lg border-2 ${formData.imagesSelected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'} ${!formData.imagesSent ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formData.imagesSelected ? 'bg-emerald-500 text-white' : formData.imagesSent ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {formData.imagesSelected ? '✓' : '2'}
                </div>
                <div>
                  <p className="font-medium text-slate-800">Client Has Selected Images</p>
                  <p className="text-xs text-slate-500">Has the client completed selection?</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.imagesSelected}
                  disabled={!formData.imagesSent}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    imagesSelected: e.target.checked,
                    imagesSelectedDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
            
            {formData.imagesSelected && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Selection Date</label>
                  <input
                    type="date"
                    value={formData.imagesSelectedDate}
                    onChange={(e) => setFormData({ ...formData, imagesSelectedDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Images Selected</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.selectedImagesCount}
                    onChange={(e) => setFormData({ ...formData, selectedImagesCount: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g., 150"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Images Delivered */}
          <div className={`p-4 rounded-lg border-2 ${formData.imagesDelivered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'} ${!formData.imagesSelected ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formData.imagesDelivered ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {formData.imagesDelivered ? '✓' : '3'}
                </div>
                <div>
                  <p className="font-medium text-slate-800">Final Images Delivered</p>
                  <p className="text-xs text-slate-500">Have you delivered the final images?</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.imagesDelivered}
                  disabled={!formData.imagesSelected}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    imagesDelivered: e.target.checked,
                    imagesDeliveredDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-50"></div>
              </label>
            </div>
            
            {formData.imagesDelivered && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Delivery Date</label>
                <input
                  type="date"
                  value={formData.imagesDeliveredDate}
                  onChange={(e) => setFormData({ ...formData, imagesDeliveredDate: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            )}
          </div>

          {/* Selection Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={formData.selectionNotes}
              onChange={(e) => setFormData({ ...formData, selectionNotes: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
              rows="2"
              placeholder="Any notes about selection..."
            />
          </div>

          {/* Summary */}
          {formData.totalImagesSent > 0 && formData.selectedImagesCount > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                <strong>Summary:</strong> {formData.selectedImagesCount} of {formData.totalImagesSent} images selected 
                ({Math.round((formData.selectedImagesCount / formData.totalImagesSent) * 100)}%)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
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

// ===== EDIT PROJECT MODAL =====
function EditProjectModal({ project, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    location: project.location || '',
    workType: project.workType || 'photo',
    amount: project.amount || '',
    advanceAmount: project.advanceAmount || '',
    amountPaid: project.amountPaid || '',
    priority: project.priority || 'medium',
    category: project.category || 'General',
    status: project.status || 'pending',
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    eventDate: project.eventDate ? new Date(project.eventDate).toISOString().split('T')[0] : ''
  })

  const categories = ['Wedding', 'Pre-Wedding', 'Event', 'Corporate', 'Portrait', 'Product', 'Commercial', 'Birthday', 'Engagement', 'Other']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const amount = parseFloat(formData.amount) || 0
    const amountPaid = parseFloat(formData.amountPaid) || 0
    const advanceAmount = parseFloat(formData.advanceAmount) || 0
    
    let paymentStatus = 'unpaid'
    if (amount > 0) {
      if (amountPaid >= amount) {
        paymentStatus = 'paid'
      } else if (amountPaid > advanceAmount) {
        paymentStatus = 'partial'
      } else if (advanceAmount > 0) {
        paymentStatus = 'advance'
      }
    }

    try {
      await onSubmit({
        ...formData,
        amount: amount,
        amountPaid: amountPaid,
        advanceAmount: advanceAmount,
        paymentStatus,
        dueDate: formData.dueDate || null,
        eventDate: formData.eventDate || null
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
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Edit Project</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">📍 Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type of Work</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'photo', label: 'Photo', icon: '📷' },
                { value: 'video', label: 'Video', icon: '🎬' },
                { value: 'both', label: 'Both', icon: '📷🎬' }
              ].map((type) => (
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Advance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Paid</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="w-full p-3 pl-8 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Dates & Category */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Event Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg"
              rows="3"
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

// ===== PAYMENT MODAL =====
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
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
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