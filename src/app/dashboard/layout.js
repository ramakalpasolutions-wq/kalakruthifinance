'use client'

import { useAuth } from '@/context/AuthContext'
import { TransactionProvider } from '@/context/TransactionContext'
import { ProjectProvider } from '@/context/ProjectContext'
import { BillProvider } from '@/context/BillContext'
import { EMIProvider } from '@/context/EMIContext'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <TransactionProvider>
      <ProjectProvider>
        <BillProvider>
          <EMIProvider>
            <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </EMIProvider>
        </BillProvider>
      </ProjectProvider>
    </TransactionProvider>
  )
}