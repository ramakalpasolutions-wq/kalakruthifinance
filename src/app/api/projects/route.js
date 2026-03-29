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

// GET all projects
export async function GET(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let query = {}
    if (status) query.status = status
    if (priority) query.priority = priority

    const projects = await Project.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('GET Projects Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST new project
export async function POST(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()
    
    // Log received data for debugging
    console.log('Received project data:', data)

    // Ensure amount fields are numbers
    const projectData = {
      title: data.title,
      description: data.description || '',
      clientName: data.clientName || '',
      workType: data.workType || 'photo',
      amount: Number(data.amount) || 0,
      amountPaid: Number(data.amountPaid) || 0,
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus || 'unpaid',
      category: data.category || 'General',
      dueDate: data.dueDate || null
    }

    // Calculate payment status
    if (projectData.amount > 0) {
      if (projectData.amountPaid >= projectData.amount) {
        projectData.paymentStatus = 'paid'
      } else if (projectData.amountPaid > 0) {
        projectData.paymentStatus = 'partial'
      } else {
        projectData.paymentStatus = 'unpaid'
      }
    }

    console.log('Saving project data:', projectData)

    const project = await Project.create(projectData)

    console.log('Saved project:', project)

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('POST Project Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}