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

// GET single EMI
export async function GET(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const emi = await EMI.findById(id)

    if (!emi) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    // Add computed fields
    const emiObj = emi.toObject()
    emiObj.remainingEmis = emi.totalEmis - emi.emisPaid
    emiObj.totalPaidAmount = emi.paymentHistory.reduce((sum, p) => sum + p.amount, 0)
    emiObj.remainingAmount = (emi.totalEmis - emi.emisPaid) * emi.emiAmount
    emiObj.progress = Math.round((emi.emisPaid / emi.totalEmis) * 100)

    // Generate EMI schedule
    const schedule = []
    const startDate = new Date(emi.startDate)
    
    for (let i = 0; i < emi.totalEmis; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)
      dueDate.setDate(emi.emiDay)

      const payment = emi.paymentHistory.find(p => p.emiNumber === i + 1)
      
      schedule.push({
        emiNumber: i + 1,
        dueDate: dueDate,
        amount: emi.emiAmount,
        status: payment ? payment.status : (i < emi.emisPaid ? 'paid' : 'pending'),
        paidDate: payment ? payment.paidDate : null,
        paidAmount: payment ? payment.amount : 0
      })
    }
    
    emiObj.schedule = schedule

    return NextResponse.json({ emi: emiObj })
  } catch (error) {
    console.error('GET EMI Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update EMI
export async function PUT(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const data = await request.json()

    console.log('Update EMI ID:', id)
    console.log('Update data:', data)

    const emi = await EMI.findById(id)
    if (!emi) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    // If paying an EMI
    if (data.payEmi) {
      const nextEmiNumber = emi.emisPaid + 1
      
      if (nextEmiNumber > emi.totalEmis) {
        return NextResponse.json({ error: 'All EMIs already paid' }, { status: 400 })
      }

      const startDate = new Date(emi.startDate)
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + (nextEmiNumber - 1))
      dueDate.setDate(emi.emiDay)

      const paymentRecord = {
        emiNumber: nextEmiNumber,
        amount: data.paidAmount || emi.emiAmount,
        paidDate: data.paidDate ? new Date(data.paidDate) : new Date(),
        dueDate: dueDate,
        status: data.paidDate && new Date(data.paidDate) > dueDate ? 'late' : 'paid',
        lateFee: Number(data.lateFee) || 0,
        notes: data.paymentNotes || ''
      }

      emi.paymentHistory.push(paymentRecord)
      emi.emisPaid = nextEmiNumber

      // Check if completed
      if (emi.emisPaid >= emi.totalEmis) {
        emi.status = 'completed'
        emi.completedAt = new Date()
      }

      await emi.save()

      return NextResponse.json({ emi, message: `EMI ${nextEmiNumber} marked as paid` })
    }

    // Regular update
    const updateData = { ...data }
    
    if (data.loanAmount !== undefined) updateData.loanAmount = Number(data.loanAmount)
    if (data.emiAmount !== undefined) updateData.emiAmount = Number(data.emiAmount)
    if (data.totalEmis !== undefined) updateData.totalEmis = Number(data.totalEmis)
    if (data.emisPaid !== undefined) updateData.emisPaid = Number(data.emisPaid)
    if (data.interestRate !== undefined) updateData.interestRate = Number(data.interestRate)
    if (data.emiDay !== undefined) updateData.emiDay = Number(data.emiDay)

    // Check if completed
    if (updateData.emisPaid >= (updateData.totalEmis || emi.totalEmis)) {
      updateData.status = 'completed'
      updateData.completedAt = new Date()
    }

    const updatedEmi = await EMI.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json({ emi: updatedEmi })
  } catch (error) {
    console.error('PUT EMI Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE EMI
export async function DELETE(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const emi = await EMI.findByIdAndDelete(id)

    if (!emi) {
      return NextResponse.json({ error: 'EMI not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'EMI deleted' })
  } catch (error) {
    console.error('DELETE EMI Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}