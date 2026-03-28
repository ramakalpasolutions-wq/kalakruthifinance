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
    priority: 'medium',
    category: 'General',
    dueDate: ''
  })

  const categories = ['General', 'Work', 'Personal', 'Client', 'Study', 'Home', 'Other']

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a project title')
      return
    }

    setLoading(true)
    try {
      await addProject({
        ...formData,
        dueDate: formData.dueDate || null
      })
      alert('Project added successfully!')
      router.push('/dashboard/projects')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New Project</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new task or project</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              placeholder="Add project details..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 text-black gap-3">
              {[
                { value: 'low', label: 'Low', color: 'border-slate-400 bg-slate-50' },
                { value: 'medium', label: 'Medium', color: 'border-sky-500 bg-sky-50' },
                { value: 'high', label: 'High', color: 'border-amber-500 bg-amber-50' },
                { value: 'urgent', label: 'Urgent', color: 'border-rose-500 bg-rose-50' }
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
                  <p className="text-sm font-medium">{option.label}</p>
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
                className="w-full p-3 border border-slate-200 text-black rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full p-3 border border-slate-200 text-black rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
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