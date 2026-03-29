import mongoose from 'mongoose'

// Delete old model if exists
if (mongoose.models.Bill) {
  delete mongoose.models.Bill
}

const BillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a bill title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: 0
  },
  category: {
    type: String,
    default: 'Other'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    default: 'monthly'
  },
  customDays: {
    type: Number,
    default: null
  },
  reminderDays: {
    type: Number,
    default: 3
  },
  notes: {
    type: String,
    default: ''
  },
  autopay: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date,
    default: null
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Bill = mongoose.model('Bill', BillSchema)

export default Bill