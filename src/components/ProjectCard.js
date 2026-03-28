'use client'

import { useState } from 'react'
import { useProjects } from '@/context/ProjectContext'

export default function ProjectCard({ project }) {
  const { updateProject, deleteProject, toggleStatus } = useProjects()
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

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

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed'

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

  return (
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${
                project.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'
              }`}>
                {project.title}
              </h3>
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

            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                📁 {project.category}
              </span>
              {project.dueDate && (
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-medium' : ''}`}>
                  📅 {formatDate(project.dueDate)}
                </span>
              )}
              <span className="flex items-center gap-1">
                🕐 {formatDate(project.createdAt)}
              </span>
            </div>

            {/* Description */}
            {project.description && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-indigo-600 text-sm mt-2 hover:text-indigo-700"
              >
                {showDetails ? '▼ Hide details' : '▶ Show details'}
              </button>
            )}

            {showDetails && project.description && (
              <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {project.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {project.status !== 'completed' && (
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}