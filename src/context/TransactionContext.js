'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const TransactionContext = createContext()

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/transactions')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (transaction) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setTransactions([data.transaction, ...transactions])
    return data.transaction
  }

  const addPayment = async (transactionId, payment) => {
    const res = await fetch(`/api/transactions/${transactionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setTransactions(transactions.map(t =>
      t._id === transactionId ? data.transaction : t
    ))
    return data.transaction
  }

  const deleteTransaction = async (id) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    setTransactions(transactions.filter(t => t._id !== id))
  }

  // Calculate stats including pending count
  const pendingTransactions = transactions.filter(t => 
    ['given', 'taken'].includes(t.type) && t.status !== 'completed'
  )

  const stats = {
    totalGiven: transactions.filter(t => t.type === 'given').reduce((sum, t) => sum + t.amount, 0),
    totalTaken: transactions.filter(t => t.type === 'taken').reduce((sum, t) => sum + t.amount, 0),
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    pendingToReceive: transactions
      .filter(t => t.type === 'given' && t.status !== 'completed')
      .reduce((sum, t) => {
        const paid = t.payments.reduce((s, p) => s + p.amount, 0)
        return sum + (t.amount - paid)
      }, 0),
    pendingToPay: transactions
      .filter(t => t.type === 'taken' && t.status !== 'completed')
      .reduce((sum, t) => {
        const paid = t.payments.reduce((s, p) => s + p.amount, 0)
        return sum + (t.amount - paid)
      }, 0),
    pendingCount: pendingTransactions.length,
    pendingGivenCount: pendingTransactions.filter(t => t.type === 'given').length,
    pendingTakenCount: pendingTransactions.filter(t => t.type === 'taken').length
  }

  return (
    <TransactionContext.Provider value={{
      transactions, loading, stats, pendingTransactions,
      fetchTransactions, addTransaction, addPayment, deleteTransaction
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactions = () => useContext(TransactionContext)