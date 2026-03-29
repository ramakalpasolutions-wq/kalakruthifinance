'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const EMIContext = createContext()

export function EMIProvider({ children }) {
  const [emis, setEmis] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEmis = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/emis')
      if (res.ok) {
        const data = await res.json()
        setEmis(data.emis || [])
      }
    } catch (error) {
      console.error('Failed to fetch EMIs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmis()
  }, [fetchEmis])

  const addEmi = async (emi) => {
    const res = await fetch('/api/emis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emi)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    await fetchEmis() // Refresh to get computed fields
    return data.emi
  }

  const updateEmi = async (id, updates) => {
    const res = await fetch(`/api/emis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    await fetchEmis() // Refresh to get updated computed fields
    return data.emi
  }

  const payEmi = async (id, paymentData = {}) => {
    return updateEmi(id, {
      payEmi: true,
      ...paymentData
    })
  }

  const deleteEmi = async (id) => {
    const res = await fetch(`/api/emis/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    setEmis(prev => prev.filter(e => e._id !== id))
  }

  const getEmiDetails = async (id) => {
    const res = await fetch(`/api/emis/${id}`)
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    const data = await res.json()
    return data.emi
  }

  // Computed values
  const activeEmis = useMemo(() => 
    emis.filter(e => e.status === 'active'), 
    [emis]
  )

  const completedEmis = useMemo(() => 
    emis.filter(e => e.status === 'completed'), 
    [emis]
  )

  // EMIs due this month
  const emisDueThisMonth = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return activeEmis.filter(emi => {
      if (!emi.nextEmiDate) return false
      const nextDate = new Date(emi.nextEmiDate)
      return nextDate.getMonth() === currentMonth && nextDate.getFullYear() === currentYear
    })
  }, [activeEmis])

  const stats = useMemo(() => {
    const active = emis.filter(e => e.status === 'active')
    
    return {
      total: emis.length,
      active: active.length,
      completed: emis.filter(e => e.status === 'completed').length,
      totalLoanAmount: emis.reduce((sum, e) => sum + (e.loanAmount || 0), 0),
      totalMonthlyEmi: active.reduce((sum, e) => sum + (e.emiAmount || 0), 0),
      totalPaid: emis.reduce((sum, e) => sum + (e.totalPaidAmount || 0), 0),
      totalRemaining: active.reduce((sum, e) => sum + (e.remainingAmount || 0), 0),
      totalRemainingEmis: active.reduce((sum, e) => sum + (e.remainingEmis || 0), 0),
      dueThisMonth: emisDueThisMonth.length,
      dueThisMonthAmount: emisDueThisMonth.reduce((sum, e) => sum + (e.emiAmount || 0), 0)
    }
  }, [emis, emisDueThisMonth])

  const value = {
    emis,
    loading,
    stats,
    activeEmis,
    completedEmis,
    emisDueThisMonth,
    fetchEmis,
    addEmi,
    updateEmi,
    payEmi,
    deleteEmi,
    getEmiDetails
  }

  return (
    <EMIContext.Provider value={value}>
      {children}
    </EMIContext.Provider>
  )
}

export const useEmis = () => {
  const context = useContext(EMIContext)
  if (!context) {
    return {
      emis: [],
      loading: true,
      stats: {
        total: 0, active: 0, completed: 0,
        totalLoanAmount: 0, totalMonthlyEmi: 0,
        totalPaid: 0, totalRemaining: 0, totalRemainingEmis: 0,
        dueThisMonth: 0, dueThisMonthAmount: 0
      },
      activeEmis: [],
      completedEmis: [],
      emisDueThisMonth: []
    }
  }
  return context
}