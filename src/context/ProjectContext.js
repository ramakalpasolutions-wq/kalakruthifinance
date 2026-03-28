'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const addProject = async (project) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setProjects(prev => [data.project, ...prev])
    return data.project
  }

  const updateProject = async (id, updates) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setProjects(prev => prev.map(p => p._id === id ? data.project : p))
    return data.project
  }

  const deleteProject = async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    setProjects(prev => prev.filter(p => p._id !== id))
  }

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    return updateProject(id, { status: newStatus })
  }

  // Computed values
  const pendingProjects = useMemo(() => 
    projects.filter(p => p.status !== 'completed'), 
    [projects]
  )

  const completedProjects = useMemo(() => 
    projects.filter(p => p.status === 'completed'), 
    [projects]
  )

  const stats = useMemo(() => ({
    total: projects.length,
    pending: projects.filter(p => p.status === 'pending').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    urgent: projects.filter(p => p.priority === 'urgent' && p.status !== 'completed').length,
    high: projects.filter(p => p.priority === 'high' && p.status !== 'completed').length
  }), [projects])

  const value = {
    projects,
    loading,
    stats,
    pendingProjects,
    completedProjects,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    toggleStatus
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    return {
      projects: [],
      loading: true,
      stats: { total: 0, pending: 0, inProgress: 0, completed: 0, urgent: 0, high: 0 },
      pendingProjects: [],
      completedProjects: []
    }
  }
  return context
}