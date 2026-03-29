import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Bill from '@/lib/models/Bill'

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

// GET single bill
export async function GET(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const bill = await Bill.findById(id)

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json({ bill })
  } catch (error) {
    console.error('GET Bill Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update bill
export async function PUT(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const data = await request.json()

    console.log('Update bill ID:', id)
    console.log('Update data:', data)

    const updateData = { ...data }

    // Handle amount
    if (data.amount !== undefined) {
      updateData.amount = Number(data.amount) || 0
    }

    // Handle paid status
    if (data.status === 'paid' && !data.paidDate) {
      updateData.paidDate = new Date()
      updateData.paidAmount = updateData.amount || 0
    }

    // If marking as paid and it's recurring, create next bill
    if (data.status === 'paid' && data.isRecurring && data.createNext) {
      const currentBill = await Bill.findById(id)
      if (currentBill) {
        const nextDueDate = calculateNextDueDate(
          currentBill.dueDate,
          currentBill.frequency,
          currentBill.customDays
        )

        await Bill.create({
          title: currentBill.title,
          amount: currentBill.amount,
          category: currentBill.category,
          dueDate: nextDueDate,
          status: 'pending',
          isRecurring: true,
          frequency: currentBill.frequency,
          customDays: currentBill.customDays,
          reminderDays: currentBill.reminderDays,
          notes: currentBill.notes,
          autopay: currentBill.autopay
        })
      }
    }

    const bill = await Bill.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json({ bill })
  } catch (error) {
    console.error('PUT Bill Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE bill
export async function DELETE(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const bill = await Bill.findByIdAndDelete(id)

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Bill deleted' })
  } catch (error) {
    console.error('DELETE Bill Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(currentDate, frequency, customDays) {
  const date = new Date(currentDate)

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    case 'custom':
      date.setDate(date.getDate() + (customDays || 30))
      break
    default:
      date.setMonth(date.getMonth() + 1)
  }

  return date
}