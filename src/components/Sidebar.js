'use client'

import { useState, useEffect } from 'react'
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
  const { stats: emiStats } = useEmis()

  // Collapsed state for each section
  const [collapsed, setCollapsed] = useState({
    main: false,
    projects: false,
    emi: false,
    bills: false,
    money: false
  })

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      setCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSection = (section) => {
    const newState = { ...collapsed, [section]: !collapsed[section] }
    setCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

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
      section: 'main',
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      ]
    },
    {
      section: 'projects',
      label: 'Projects',
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
        { href: '/dashboard/projects/add', label: 'Add Project', icon: '➕' },
      ]
    },
    {
      section: 'emi',
      label: 'EMI Tracker',
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
        { href: '/dashboard/emi/add', label: 'Add EMI', icon: '➕' },
      ]
    },
    {
      section: 'bills',
      label: 'Bills',
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
        { href: '/dashboard/bills/add', label: 'Add Bill', icon: '➕' },
      ]
    },
    {
      section: 'money',
      label: 'Money',
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
            <h1 className="font-bold text-lg">Kalakruthi</h1>
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

      {/* Collapse All / Expand All */}
      <div className="px-3 pt-3 flex gap-2">
        <button
          onClick={() => {
            const allCollapsed = { main: true, projects: true, emi: true, bills: true, money: true }
            setCollapsed(allCollapsed)
            localStorage.setItem('sidebarCollapsed', JSON.stringify(allCollapsed))
          }}
          className="flex-1 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded transition"
        >
          Collapse All
        </button>
        <button
          onClick={() => {
            const allExpanded = { main: false, projects: false, emi: false, bills: false, money: false }
            setCollapsed(allExpanded)
            localStorage.setItem('sidebarCollapsed', JSON.stringify(allExpanded))
          }}
          className="flex-1 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded transition"
        >
          Expand All
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-2">
            {/* Section Header - Clickable */}
            <button
              onClick={() => toggleSection(section.section)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition group"
            >
              <span>{section.label}</span>
              <span className={`transform transition-transform duration-200 ${
                collapsed[section.section] ? '-rotate-90' : 'rotate-0'
              }`}>
                ▼
              </span>
            </button>

            {/* Section Items - Collapsible */}
            <div className={`overflow-hidden transition-all duration-300 ${
              collapsed[section.section] ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
            }`}>
              <ul className="space-y-1 mt-1">
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
          </div>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Summary
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Monthly EMI</span>
            <span className="text-indigo-400 font-medium">
              ₹{(emiStats?.totalMonthlyEmi || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">To Receive</span>
            <span className="text-emerald-400 font-medium">
              ₹{(stats?.pendingToReceive || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">To Pay</span>
            <span className="text-rose-400 font-medium">
              ₹{(stats?.pendingToPay || 0).toLocaleString()}
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