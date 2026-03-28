'use client'

import { useState } from 'react'
import { useProjects } from '@/context/ProjectContext'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'

export default function ProjectsPage() {
  const { projects, stats, loading } = useProjects()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch = search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
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
          <h1 className="text-2xl font-bold text-slate-800">All Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your tasks and projects</p>
        </div>
        <Link
          href="/dashboard/projects/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-amber-500 p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-sky-500 p-4">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-sky-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-emerald-500 p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 text-black top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border text-black border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex  gap-2 ">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📁</span>
          </div>
          <p className="text-slate-500">No projects found</p>
          <Link
            href="/dashboard/projects/add"
            className="inline-block mt-4 text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Add your first project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}