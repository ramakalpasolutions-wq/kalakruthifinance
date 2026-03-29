import mongoose from 'mongoose'

// Delete old model if exists
if (mongoose.models.EMI) {
  delete mongoose.models.EMI
}

const PaymentHistorySchema = new mongoose.Schema({
  emiNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'late'],
    default: 'paid'
  },
  lateFee: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
})

const EMISchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide EMI title'],
    trim: true
  },
  loanType: {
    type: String,
    enum: ['home', 'car', 'personal', 'education', 'bike', 'gold', 'business', 'other'],
    default: 'personal'
  },
  lenderName: {
    type: String,
    default: ''
  },
  loanAccountNumber: {
    type: String,
    default: ''
  },
  loanAmount: {
    type: Number,
    required: [true, 'Please provide loan amount'],
    min: 0
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0
  },
  emiAmount: {
    type: Number,
    required: [true, 'Please provide EMI amount'],
    min: 0
  },
  totalEmis: {
    type: Number,
    required: [true, 'Please provide total EMIs'],
    min: 1
  },
  emisPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  emiDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 31
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'paused'],
    default: 'active'
  },
  paymentHistory: [PaymentHistorySchema],
  notes: {
    type: String,
    default: ''
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

// Virtual for remaining EMIs
EMISchema.virtual('remainingEmis').get(function() {
  return this.totalEmis - this.emisPaid
})

// Virtual for total paid amount
EMISchema.virtual('totalPaidAmount').get(function() {
  return this.paymentHistory.reduce((sum, p) => sum + p.amount, 0)
})

// Virtual for remaining amount
EMISchema.virtual('remainingAmount').get(function() {
  return (this.totalEmis - this.emisPaid) * this.emiAmount
})

// Virtual for next EMI date
EMISchema.virtual('nextEmiDate').get(function() {
  if (this.emisPaid >= this.totalEmis) return null
  
  const startDate = new Date(this.startDate)
  const nextEmiMonth = this.emisPaid
  
  const nextDate = new Date(startDate)
  nextDate.setMonth(nextDate.getMonth() + nextEmiMonth)
  nextDate.setDate(this.emiDay)
  
  return nextDate
})

// Include virtuals in JSON
EMISchema.set('toJSON', { virtuals: true })
EMISchema.set('toObject', { virtuals: true })

const EMI = mongoose.model('EMI', EMISchema)

export default EMI