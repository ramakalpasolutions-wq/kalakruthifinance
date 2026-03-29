import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Project from '@/lib/models/Project'

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

// GET single project
export async function GET(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const project = await Project.findById(id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('GET Project Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update project
export async function PUT(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const data = await request.json()

    console.log('Update project ID:', id)
    console.log('Update data received:', data)

    // Prepare update data
    const updateData = { ...data }

    // Ensure amount fields are numbers
    if (data.amount !== undefined) {
      updateData.amount = Number(data.amount) || 0
    }
    if (data.amountPaid !== undefined) {
      updateData.amountPaid = Number(data.amountPaid) || 0
    }

    // Calculate payment status
    if (updateData.amount !== undefined || updateData.amountPaid !== undefined) {
      const amount = updateData.amount ?? 0
      const amountPaid = updateData.amountPaid ?? 0
      
      if (amount > 0) {
        if (amountPaid >= amount) {
          updateData.paymentStatus = 'paid'
        } else if (amountPaid > 0) {
          updateData.paymentStatus = 'partial'
        } else {
          updateData.paymentStatus = 'unpaid'
        }
      }
    }

    // Handle completed status
    if (data.status === 'completed') {
      updateData.completedAt = new Date()
    } else if (data.status && data.status !== 'completed') {
      updateData.completedAt = null
    }

    console.log('Final update data:', updateData)

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    console.log('Updated project:', project)

    return NextResponse.json({ project })
  } catch (error) {
    console.error('PUT Project Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE project
export async function DELETE(request, { params }) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const project = await Project.findByIdAndDelete(id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Project deleted' })
  } catch (error) {
    console.error('DELETE Project Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}