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
    clientName: '',
    workType: 'photo',
    amount: '',
    priority: 'medium',
    category: 'General',
    dueDate: ''
  })

  const categories = ['General', 'Wedding', 'Event', 'Corporate', 'Portrait', 'Product', 'Commercial', 'Personal', 'Other']

  const workTypes = [
    { value: 'photo', label: 'Photo', icon: '📷', desc: 'Photography work' },
    { value: 'video', label: 'Video', icon: '🎬', desc: 'Videography work' },
    { value: 'both', label: 'Photo + Video', icon: '📷🎬', desc: 'Both photo & video' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a project title')
      return
    }

    setLoading(true)
    
    try {
      // Parse amount as number
      const amountValue = formData.amount ? parseFloat(formData.amount) : 0
      
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        clientName: formData.clientName.trim(),
        workType: formData.workType,
        amount: amountValue,
        amountPaid: 0,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || null,
        status: 'pending',
        paymentStatus: 'unpaid'
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New Project</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new work project</p>
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
              placeholder="e.g., Wedding Shoot - Sharma Family"
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
              placeholder="Enter client name"
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
              Total Amount (₹)
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
            <p className="text-xs text-slate-400 mt-1">Total project cost / payment expected</p>
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
              rows="4"
              placeholder="Add details like location, special requirements, deliverables..."
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
                  {formData.clientName && (
                    <p className="text-sm text-slate-500">Client: {formData.clientName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                      {formData.workType === 'photo' ? 'Photo' : formData.workType === 'video' ? 'Video' : 'Photo + Video'}
                    </span>
                    {formData.amount && (
                      <span className="text-emerald-600 font-semibold">
                        ₹{parseFloat(formData.amount).toLocaleString()}
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