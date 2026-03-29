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

// GET all bills
export async function GET(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const isRecurring = searchParams.get('isRecurring')

    let query = {}
    if (status) query.status = status
    if (isRecurring !== null && isRecurring !== undefined) {
      query.isRecurring = isRecurring === 'true'
    }

    const bills = await Bill.find(query).sort({ dueDate: 1 })

    // Update overdue status
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updatedBills = bills.map(bill => {
      const billObj = bill.toObject()
      if (bill.status === 'pending' && new Date(bill.dueDate) < today) {
        billObj.status = 'overdue'
      }
      return billObj
    })

    return NextResponse.json({ bills: updatedBills })
  } catch (error) {
    console.error('GET Bills Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST new bill
export async function POST(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()

    console.log('Received bill data:', data)

    const billData = {
      title: data.title,
      amount: Number(data.amount) || 0,
      category: data.category || 'Other',
      dueDate: data.dueDate,
      status: data.status || 'pending',
      isRecurring: data.isRecurring || false,
      frequency: data.frequency || 'monthly',
      customDays: data.customDays ? Number(data.customDays) : null,
      reminderDays: Number(data.reminderDays) || 3,
      notes: data.notes || '',
      autopay: data.autopay || false
    }

    const bill = await Bill.create(billData)

    console.log('Created bill:', bill)

    return NextResponse.json({ bill }, { status: 201 })
  } catch (error) {
    console.error('POST Bill Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}