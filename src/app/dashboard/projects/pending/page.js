'use client'

import { useState, useMemo } from 'react'
import { useProjects } from '@/context/ProjectContext'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'

export default function ProjectsPage() {
  const { projects, stats, loading } = useProjects()
  const [filter, setFilter] = useState('all')
  const [workTypeFilter, setWorkTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Calculate totals
  const totals = useMemo(() => {
    const filtered = projects.filter(p => {
      if (workTypeFilter !== 'all' && p.workType !== workTypeFilter) return false
      return true
    })

    return {
      totalAmount: filtered.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalPaid: filtered.reduce((sum, p) => sum + (p.amountPaid || 0), 0),
      totalPending: filtered.reduce((sum, p) => sum + ((p.amount || 0) - (p.amountPaid || 0)), 0),
      photoProjects: projects.filter(p => p.workType === 'photo').length,
      videoProjects: projects.filter(p => p.workType === 'video').length,
      bothProjects: projects.filter(p => p.workType === 'both').length
    }
  }, [projects, workTypeFilter])

  const filtered = projects.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter
    const matchesWorkType = workTypeFilter === 'all' || p.workType === workTypeFilter
    const matchesSearch = search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesWorkType && matchesSearch
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
          <p className="text-slate-500 text-sm mt-1">Manage your work projects</p>
        </div>
        <Link
          href="/dashboard/projects/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          + Add Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-indigo-500 p-4">
          <p className="text-sm text-slate-500">Total Value</p>
          <p className="text-xl font-bold text-indigo-600">₹{totals.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-rose-500 p-4">
          <p className="text-sm text-slate-500">Pending Payment</p>
          <p className="text-xl font-bold text-rose-600">₹{totals.totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Work Type Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setWorkTypeFilter(workTypeFilter === 'photo' ? 'all' : 'photo')}
          className={`p-4 rounded-lg border-2 transition ${
            workTypeFilter === 'photo' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl">📷</span>
              <p className="font-semibold text-slate-800 mt-2">Photo</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{totals.photoProjects}</p>
          </div>
        </button>
        <button
          onClick={() => setWorkTypeFilter(workTypeFilter === 'video' ? 'all' : 'video')}
          className={`p-4 rounded-lg border-2 transition ${
            workTypeFilter === 'video' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl">🎬</span>
              <p className="font-semibold text-slate-800 mt-2">Video</p>
            </div>
            <p className="text-2xl font-bold text-pink-600">{totals.videoProjects}</p>
          </div>
        </button>
        <button
          onClick={() => setWorkTypeFilter(workTypeFilter === 'both' ? 'all' : 'both')}
          className={`p-4 rounded-lg border-2 transition ${
            workTypeFilter === 'both' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl">📷🎬</span>
              <p className="font-semibold text-slate-800 mt-2">Both</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{totals.bothProjects}</p>
          </div>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, client, category..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
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
        
        {workTypeFilter !== 'all' && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-500">Filtered by:</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
              {workTypeFilter === 'photo' ? '📷 Photo' : workTypeFilter === 'video' ? '🎬 Video' : '📷🎬 Both'}
            </span>
            <button
              onClick={() => setWorkTypeFilter('all')}
              className="text-sm text-rose-600 hover:text-rose-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {projects.length} projects
        {totals.totalPending > 0 && (
          <span className="ml-2 text-rose-600">
            • ₹{totals.totalPending.toLocaleString()} pending payment
          </span>
        )}
      </p>

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