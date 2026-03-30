import mongoose from 'mongoose'

// Delete old model if exists
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
  location: {
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
  advanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  advanceDate: {
    type: Date,
    default: null
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // ===== IMAGE SELECTION TRACKING =====
  // Are images sent to client?
  imagesSent: {
    type: Boolean,
    default: false
  },
  imagesSentDate: {
    type: Date,
    default: null
  },
  // Total images sent for selection
  totalImagesSent: {
    type: Number,
    default: 0
  },
  // Has client selected images?
  imagesSelected: {
    type: Boolean,
    default: false
  },
  imagesSelectedDate: {
    type: Date,
    default: null
  },
  // How many images selected by client
  selectedImagesCount: {
    type: Number,
    default: 0
  },
  // Are final images delivered?
  imagesDelivered: {
    type: Boolean,
    default: false
  },
  imagesDeliveredDate: {
    type: Date,
    default: null
  },
  // Selection notes/comments
  selectionNotes: {
    type: String,
    default: ''
  },
  // ===== END IMAGE SELECTION =====

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
    enum: ['unpaid', 'advance', 'partial', 'paid'],
    default: 'unpaid'
  },
  dueDate: {
    type: Date,
    default: null
  },
  eventDate: {
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