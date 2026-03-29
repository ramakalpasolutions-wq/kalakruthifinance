'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const BillContext = createContext()

export function BillProvider({ children }) {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bills')
      if (res.ok) {
        const data = await res.json()
        setBills(data.bills || [])
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  const addBill = async (bill) => {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setBills(prev => [...prev, data.bill].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)))
    return data.bill
  }

  const updateBill = async (id, updates) => {
    const res = await fetch(`/api/bills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    
    // If it was recurring and paid, refresh to get new bill
    if (updates.status === 'paid' && updates.isRecurring && updates.createNext) {
      await fetchBills()
    } else {
      setBills(prev => prev.map(b => b._id === id ? data.bill : b))
    }
    
    return data.bill
  }

  const deleteBill = async (id) => {
    const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    setBills(prev => prev.filter(b => b._id !== id))
  }

  const markAsPaid = async (id, createNext = true) => {
    const bill = bills.find(b => b._id === id)
    if (!bill) return

    return updateBill(id, {
      status: 'paid',
      paidDate: new Date(),
      paidAmount: bill.amount,
      isRecurring: bill.isRecurring,
      createNext: bill.isRecurring ? createNext : false
    })
  }

  // Computed values
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingBills = useMemo(() => {
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return bill.status !== 'paid' && dueDate >= today
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [bills])

  const overdueBills = useMemo(() => {
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return bill.status !== 'paid' && dueDate < today
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [bills])

  const recurringBills = useMemo(() => {
    return bills.filter(bill => bill.isRecurring)
  }, [bills])

  const paidBills = useMemo(() => {
    return bills.filter(bill => bill.status === 'paid')
  }, [bills])

  // Bills due within reminder period
  const dueSoonBills = useMemo(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate)
      return bill.status !== 'paid' && dueDate >= today && dueDate <= nextWeek
    })
  }, [bills])

  const stats = useMemo(() => ({
    total: bills.length,
    upcoming: upcomingBills.length,
    overdue: overdueBills.length,
    recurring: recurringBills.length,
    paid: paidBills.length,
    dueSoon: dueSoonBills.length,
    totalUpcoming: upcomingBills.reduce((sum, b) => sum + b.amount, 0),
    totalOverdue: overdueBills.reduce((sum, b) => sum + b.amount, 0),
    totalPaid: paidBills.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0),
    totalMonthly: recurringBills
      .filter(b => b.frequency === 'monthly')
      .reduce((sum, b) => sum + b.amount, 0)
  }), [bills, upcomingBills, overdueBills, recurringBills, paidBills, dueSoonBills])

  const value = {
    bills,
    loading,
    stats,
    upcomingBills,
    overdueBills,
    recurringBills,
    paidBills,
    dueSoonBills,
    fetchBills,
    addBill,
    updateBill,
    deleteBill,
    markAsPaid
  }

  return (
    <BillContext.Provider value={value}>
      {children}
    </BillContext.Provider>
  )
}

export const useBills = () => {
  const context = useContext(BillContext)
  if (!context) {
    return {
      bills: [],
      loading: true,
      stats: {
        total: 0, upcoming: 0, overdue: 0, recurring: 0, paid: 0, dueSoon: 0,
        totalUpcoming: 0, totalOverdue: 0, totalPaid: 0, totalMonthly: 0
      },
      upcomingBills: [],
      overdueBills: [],
      recurringBills: [],
      paidBills: [],
      dueSoonBills: []
    }
  }
  return context
}