'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/context/TransactionContext'
import { useProjects } from '@/context/ProjectContext'
import StatsCard from '@/components/StatsCard'
import ProjectCard from '@/components/ProjectCard'
import Link from 'next/link'

export default function DashboardPage() {
  const { transactions, stats } = useTransactions()
  const { pendingProjects, stats: projectStats, loading } = useProjects()

  // Get top 3 urgent/high priority projects
  const topProjects = useMemo(() => {
    return [...(pendingProjects || [])]
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 3)
  }, [pendingProjects])

  // Group pending money by person
  const pendingPeople = useMemo(() => {
    const pending = (transactions || []).filter(t => 
      ['given', 'taken'].includes(t.type) && t.status !== 'completed'
    )

    const grouped = {}
    pending.forEach(entry => {
      const key = `${entry.person}-${entry.type}`
      const totalPaid = (entry.payments || []).reduce((sum, p) => sum + p.amount, 0)
      const remaining = entry.amount - totalPaid
      
      if (!grouped[key]) {
        grouped[key] = {
          person: entry.person,
          type: entry.type,
          totalRemaining: 0
        }
      }
      grouped[key].totalRemaining += remaining
    })

    return Object.values(grouped).sort((a, b) => b.totalRemaining - a.totalRemaining)
  }, [transactions])

  const peopleToReceive = pendingPeople.filter(p => p.type === 'given').slice(0, 3)
  const peopleToPay = pendingPeople.filter(p => p.type === 'taken').slice(0, 3)

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your projects and money</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Tasks"
          amount={projectStats?.pending + projectStats?.inProgress || 0}
          icon="📋"
          variant="warning"
          isNumber={true}
        />
        <StatsCard
          title="Completed"
          amount={projectStats?.completed || 0}
          icon="✅"
          variant="success"
          isNumber={true}
        />
        <StatsCard
          title="To Receive"
          amount={stats?.pendingToReceive || 0}
          icon="📤"
          variant="primary"
        />
        <StatsCard
          title="To Pay"
          amount={stats?.pendingToPay || 0}
          icon="📥"
          variant="danger"
        />
      </div>

      {/* Urgent Alert */}
      {projectStats?.urgent > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🚨</span>
            </div>
            <div>
              <p className="font-medium text-rose-800">
                {projectStats.urgent} Urgent {projectStats.urgent === 1 ? 'Task' : 'Tasks'}
              </p>
              <p className="text-sm text-rose-600">Needs immediate attention</p>
            </div>
          </div>
          <Link
            href="/dashboard/projects/pending"
            className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition font-medium text-sm"
          >
            View Tasks
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="font-semibold text-slate-800">Pending Projects</h2>
            </div>
            <Link
              href="/dashboard/projects/pending"
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              View All ({pendingProjects?.length || 0}) →
            </Link>
          </div>
          
          {topProjects.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No pending projects</p>
              <Link
                href="/dashboard/projects/add"
                className="inline-block mt-2 text-indigo-600 font-medium"
              >
                + Add Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProjects.map((project) => (
                <div key={project._id} className="p-4">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Money Summary */}
        <div className="space-y-4">
          {/* To Receive */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📤</span>
                <h2 className="font-semibold text-slate-800">To Receive</h2>
              </div>
              <span className="text-emerald-600 font-bold">
                ₹{(stats?.pendingToReceive || 0).toLocaleString()}
              </span>
            </div>
            
            {peopleToReceive.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <p>No pending dues</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {peopleToReceive.map((person, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {person.person.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{person.person}</span>
                    </div>
                    <span className="font-bold text-emerald-600">₹{person.totalRemaining.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To Pay */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📥</span>
                <h2 className="font-semibold text-slate-800">To Pay</h2>
              </div>
              <span className="text-rose-600 font-bold">
                ₹{(stats?.pendingToPay || 0).toLocaleString()}
              </span>
            </div>
            
            {peopleToPay.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <p>No pending payments</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {peopleToPay.map((person, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {person.person.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{person.person}</span>
                    </div>
                    <span className="font-bold text-rose-600">₹{person.totalRemaining.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}