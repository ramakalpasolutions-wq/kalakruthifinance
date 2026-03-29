import mongoose from 'mongoose'

// Delete the old model if it exists (to refresh schema)
if (mongoose.models.Project) {
  delete mongoose.models.Project
}

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  clientName: {
    type: String,
    default: ''
  },
  workType: {
    type: String,
    enum: ['photo', 'video', 'both'],
    default: 'photo'
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    default: 'General'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
})

const Project = mongoose.model('Project', ProjectSchema)

export default Project