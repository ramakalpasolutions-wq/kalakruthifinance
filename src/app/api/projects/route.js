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

export async function POST(request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()

    console.log('Received project data:', data)

    const projectData = {
      title: data.title,
      description: data.description || '',
      location: data.location || '',
      workType: data.workType || 'photo',
      amount: Number(data.amount) || 0,
      advanceAmount: Number(data.advanceAmount) || 0,
      advanceDate: data.advanceDate || null,
      amountPaid: Number(data.amountPaid) || 0,
      // Image Selection Fields
      imagesSent: data.imagesSent || false,
      imagesSentDate: data.imagesSentDate || null,
      totalImagesSent: Number(data.totalImagesSent) || 0,
      imagesSelected: data.imagesSelected || false,
      imagesSelectedDate: data.imagesSelectedDate || null,
      selectedImagesCount: Number(data.selectedImagesCount) || 0,
      imagesDelivered: data.imagesDelivered || false,
      imagesDeliveredDate: data.imagesDeliveredDate || null,
      selectionNotes: data.selectionNotes || '',
      // Other fields
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus || 'unpaid',
      category: data.category || 'General',
      dueDate: data.dueDate || null,
      eventDate: data.eventDate || null
    }

    // Calculate payment status
    if (projectData.amount > 0) {
      if (projectData.amountPaid >= projectData.amount) {
        projectData.paymentStatus = 'paid'
      } else if (projectData.amountPaid > projectData.advanceAmount) {
        projectData.paymentStatus = 'partial'
      } else if (projectData.advanceAmount > 0) {
        projectData.paymentStatus = 'advance'
      } else {
        projectData.paymentStatus = 'unpaid'
      }
    }

    const project = await Project.create(projectData)

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('POST Project Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}