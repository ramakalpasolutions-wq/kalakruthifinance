'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTransactions } from '@/context/TransactionContext'
import { useProjects } from '@/context/ProjectContext'
import { useBills } from '@/context/BillContext'
import { useEmis } from '@/context/EMIContext'
import { useMemo } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { transactions, stats } = useTransactions()
  const { pendingProjects, stats: projectStats } = useProjects()
  const { stats: billStats } = useBills()
  const { stats: emiStats, emisDueThisMonth } = useEmis()

  // Count pending people
  const pendingPeopleCount = useMemo(() => {
    const pending = (transactions || []).filter(t => 
      ['given', 'taken'].includes(t.type) && t.status !== 'completed'
    )
    const uniquePeople = new Set(pending.map(t => `${t.person}-${t.type}`))
    return uniquePeople.size
  }, [transactions])

  const menuItems = [
    { 
      section: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      ]
    },
    {
      section: 'Projects',
      items: [
        { 
          href: '/dashboard/projects', 
          label: 'All Projects', 
          icon: '📁',
          badge: projectStats?.total || 0,
          badgeColor: 'bg-slate-500'
        },
        { 
          href: '/dashboard/projects/pending', 
          label: 'Pending', 
          icon: '⏳',
          badge: pendingProjects?.length || 0,
          badgeColor: 'bg-amber-500'
        },
        // { href: '/dashboard/projects/add', label: 'Add Project', icon: '➕' },
      ]
    },
    {
      section: 'EMI Tracker',
      items: [
        { 
          href: '/dashboard/emi', 
          label: 'All EMIs', 
          icon: '🏦',
          badge: emiStats?.active || 0,
          badgeColor: 'bg-indigo-500'
        },
        { 
          href: '/dashboard/emi/due', 
          label: 'Due This Month', 
          icon: '📅',
          badge: emiStats?.dueThisMonth || 0,
          badgeColor: 'bg-amber-500'
        },
        // { href: '/dashboard/emi/add', label: 'Add EMI', icon: '➕' },
      ]
    },
    {
      section: 'Bills',
      items: [
        { 
          href: '/dashboard/bills', 
          label: 'All Bills', 
          icon: '🧾',
          badge: billStats?.total || 0,
          badgeColor: 'bg-slate-500'
        },
        { 
          href: '/dashboard/bills/upcoming', 
          label: 'Upcoming', 
          icon: '📅',
          badge: billStats?.upcoming || 0,
          badgeColor: 'bg-sky-500'
        },
        { 
          href: '/dashboard/bills/overdue', 
          label: 'Overdue', 
          icon: '🚨',
          badge: billStats?.overdue || 0,
          badgeColor: 'bg-rose-500'
        },
        // { href: '/dashboard/bills/add', label: 'Add Bill', icon: '➕' },
      ]
    },
    {
      section: 'Money',
      items: [
        { href: '/dashboard/add-transaction', label: 'Add Entry', icon: '💳' },
        { 
          href: '/dashboard/pending', 
          label: 'Pending Dues', 
          icon: '📋',
          badge: pendingPeopleCount,
          badgeColor: 'bg-rose-500'
        },
        { href: '/dashboard/given', label: 'Given', icon: '📤' },
        { href: '/dashboard/taken', label: 'Taken', icon: '📥' },
        { href: '/dashboard/income', label: 'Income', icon: '💵' },
        { href: '/dashboard/expenses', label: 'Expenses', icon: '💸' },
        { href: '/dashboard/history', label: 'All History', icon: '📜' },
      ]
    }
  ]

  return (
    <aside className="w-64 bg-slate-800 text-slate-100 min-h-screen flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">TrackIt</h1>
            <p className="text-xs text-slate-400">All-in-One Tracker</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* EMI Due Alert */}
      {emiStats?.dueThisMonth > 0 && (
        <div className="mx-3 mt-3 p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span>🏦</span>
            <div>
              <p className="text-xs font-medium text-indigo-300">
                {emiStats.dueThisMonth} EMI{emiStats.dueThisMonth > 1 ? 's' : ''} Due
              </p>
              <p className="text-xs text-indigo-400">
                ₹{emiStats.dueThisMonthAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`${item.badgeColor || 'bg-slate-500'} text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Monthly EMI
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total EMI/Month</span>
            <span className="text-indigo-400 font-medium">
              ₹{(emiStats?.totalMonthlyEmi || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Remaining</span>
            <span className="text-amber-400 font-medium">
              ₹{(emiStats?.totalRemaining || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-rose-600 hover:text-white transition-all duration-200"
        >
          <span>⎋</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}