'use client'

import { useState } from 'react'
import { useProjects } from '@/context/ProjectContext'
import { useRouter } from 'next/navigation'

export default function AddProjectPage() {
  const { addProject } = useProjects()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workType: 'photo',
    amount: '',
    advanceAmount: '',
    advanceDate: '',
    priority: 'medium',
    category: 'Wedding',
    dueDate: '',
    eventDate: '',
    totalImages: ''
  })

  const categories = ['Wedding', 'Pre-Wedding', 'Event', 'Corporate', 'Portrait', 'Product', 'Commercial', 'Birthday', 'Engagement', 'Other']

  const workTypes = [
    { value: 'photo', label: 'Photo', icon: '📷', desc: 'Photography only' },
    { value: 'video', label: 'Video', icon: '🎬', desc: 'Videography only' },
    { value: 'both', label: 'Photo + Video', icon: '📷🎬', desc: 'Both services' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a project title')
      return
    }

    setLoading(true)
    
    try {
      const amountValue = formData.amount ? parseFloat(formData.amount) : 0
      const advanceValue = formData.advanceAmount ? parseFloat(formData.advanceAmount) : 0
      
      // Calculate payment status
      let paymentStatus = 'unpaid'
      let amountPaid = 0
      
      if (advanceValue > 0) {
        amountPaid = advanceValue
        if (advanceValue >= amountValue) {
          paymentStatus = 'paid'
        } else {
          paymentStatus = 'advance'
        }
      }

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        workType: formData.workType,
        amount: amountValue,
        advanceAmount: advanceValue,
        advanceDate: formData.advanceDate || null,
        amountPaid: amountPaid,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || null,
        eventDate: formData.eventDate || null,
        totalImages: parseInt(formData.totalImages) || 0,
        status: 'pending',
        paymentStatus: paymentStatus,
        selectionStatus: 'not-sent'
      }

      console.log('Submitting project:', projectData)

      await addProject(projectData)
      
      alert('Project added successfully!')
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Error adding project:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const remainingAmount = (parseFloat(formData.amount) || 0) - (parseFloat(formData.advanceAmount) || 0)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New Project</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new photography/videography project</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
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
              placeholder="e.g., Sharma Wedding, Gupta Engagement"
              required
            />
          </div>

          {/* Location (Changed from Client Name) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              📍 Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Delhi, Mumbai, Jaipur Palace"
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              📅 Event Date
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Type of Work *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {workTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, workType: type.value })}
                  className={`p-4 rounded-lg border-2 text-center transition ${
                    formData.workType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className="font-semibold text-slate-800 mt-2">{type.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              💰 Total Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Advance Payment Section */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
              💵 Advance Payment
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Advance Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.advanceAmount}
                    onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                    className="w-full p-3 pl-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Advance Date
                </label>
                <input
                  type="date"
                  value={formData.advanceDate}
                  onChange={(e) => setFormData({ ...formData, advanceDate: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Remaining Amount Preview */}
            {formData.amount && (
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                <span className="text-sm text-emerald-700">Remaining Amount:</span>
                <span className={`font-bold ${remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ₹{remainingAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Total Images (for selection tracking) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🖼️ Total Images/Deliverables (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.totalImages}
              onChange={(e) => setFormData({ ...formData, totalImages: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Track client image selection progress
            </p>
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
              placeholder="Add details like venue, special requirements, deliverables..."
            />
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
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    formData.priority === option.value
                      ? option.color
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{option.icon}</span>
                  <p className="text-sm font-medium mt-1">{option.label}</p>
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
                Delivery Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Preview Card */}
          {formData.title && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Preview</p>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">
                  {formData.workType === 'photo' ? '📷' : formData.workType === 'video' ? '🎬' : '📷🎬'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{formData.title}</h3>
                  {formData.location && (
                    <p className="text-sm text-slate-500">📍 {formData.location}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                      {formData.workType === 'photo' ? 'Photo' : formData.workType === 'video' ? 'Video' : 'Photo + Video'}
                    </span>
                    {formData.amount && (
                      <span className="text-slate-700 font-semibold">
                        ₹{parseFloat(formData.amount).toLocaleString()}
                      </span>
                    )}
                    {formData.advanceAmount && parseFloat(formData.advanceAmount) > 0 && (
                      <span className="text-emerald-600 font-medium">
                        (Adv: ₹{parseFloat(formData.advanceAmount).toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
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
              {loading ? 'Adding...' : 'Add Project'}
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