import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: String
})

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['given', 'taken', 'income', 'expense'],
    required: true
  },
  category: { type: String, required: true },
  person: { type: String, default: '' },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  payments: [PaymentSchema],
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)