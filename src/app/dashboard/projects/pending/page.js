'use client'

import { useProjects } from '@/context/ProjectContext'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'

export default function PendingProjectsPage() {
  const { pendingProjects, stats, loading } = useProjects()

  // Sort by priority
  const sortedProjects = [...pendingProjects].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pending Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Tasks that need to be completed</p>
        </div>
        <Link
          href="/dashboard/projects/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add Project
        </Link>
      </div>

      {/* Priority Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-rose-500 p-4">
          <p className="text-sm text-slate-500">Urgent</p>
          <p className="text-2xl font-bold text-rose-600">{stats.urgent}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-500 p-4">
          <p className="text-sm text-slate-500">High Priority</p>
          <p className="text-2xl font-bold text-amber-600">{stats.high}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-sky-500 p-4">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-sky-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-slate-400 p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
        </div>
      </div>

      {/* Urgent Alert */}
      {stats.urgent > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🚨</span>
          </div>
          <div>
            <p className="font-medium text-rose-800">
              You have {stats.urgent} urgent {stats.urgent === 1 ? 'task' : 'tasks'}!
            </p>
            <p className="text-sm text-rose-600">Complete them as soon as possible</p>
          </div>
        </div>
      )}

      {/* Projects List */}
      {sortedProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-slate-600 font-medium">All Done!</p>
          <p className="text-slate-400 text-sm mt-1">No pending projects</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}