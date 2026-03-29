import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import EMI from '@/lib/models/EMI'

const isAuthenticated = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return false
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    return true
  } catch {
    return false
  }
}

// GET all EMIs
export async function GET(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const loanType = searchParams.get('loanType')

    let query = {}
    if (status) query.status = status
    if (loanType) query.loanType = loanType

    const emis = await EMI.find(query).sort({ createdAt: -1 })

    // Add computed fields
    const emisWithComputed = emis.map(emi => {
      const emiObj = emi.toObject()
      emiObj.remainingEmis = emi.totalEmis - emi.emisPaid
      emiObj.totalPaidAmount = emi.paymentHistory.reduce((sum, p) => sum + p.amount, 0)
      emiObj.remainingAmount = (emi.totalEmis - emi.emisPaid) * emi.emiAmount
      emiObj.progress = Math.round((emi.emisPaid / emi.totalEmis) * 100)
      
      // Calculate next EMI date
      if (emi.emisPaid < emi.totalEmis) {
        const startDate = new Date(emi.startDate)
        const nextDate = new Date(startDate)
        nextDate.setMonth(nextDate.getMonth() + emi.emisPaid)
        nextDate.setDate(emi.emiDay)
        emiObj.nextEmiDate = nextDate
      } else {
        emiObj.nextEmiDate = null
      }
      
      return emiObj
    })

    return NextResponse.json({ emis: emisWithComputed })
  } catch (error) {
    console.error('GET EMIs Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST new EMI
export async function POST(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()

    console.log('Received EMI data:', data)

    const emiData = {
      title: data.title,
      loanType: data.loanType || 'personal',
      lenderName: data.lenderName || '',
      loanAccountNumber: data.loanAccountNumber || '',
      loanAmount: Number(data.loanAmount) || 0,
      interestRate: Number(data.interestRate) || 0,
      emiAmount: Number(data.emiAmount) || 0,
      totalEmis: Number(data.totalEmis) || 1,
      emisPaid: Number(data.emisPaid) || 0,
      startDate: data.startDate,
      emiDay: Number(data.emiDay) || 1,
      status: data.status || 'active',
      notes: data.notes || '',
      paymentHistory: []
    }

    // If some EMIs are already paid, create payment history
    if (emiData.emisPaid > 0) {
      const startDate = new Date(emiData.startDate)
      for (let i = 0; i < emiData.emisPaid; i++) {
        const dueDate = new Date(startDate)
        dueDate.setMonth(dueDate.getMonth() + i)
        dueDate.setDate(emiData.emiDay)

        emiData.paymentHistory.push({
          emiNumber: i + 1,
          amount: emiData.emiAmount,
          paidDate: dueDate,
          dueDate: dueDate,
          status: 'paid',
          lateFee: 0,
          notes: 'Initial entry'
        })
      }
    }

    const emi = await EMI.create(emiData)

    console.log('Created EMI:', emi)

    return NextResponse.json({ emi }, { status: 201 })
  } catch (error) {
    console.error('POST EMI Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}