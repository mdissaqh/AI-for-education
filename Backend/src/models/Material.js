const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  category: {
    type: String,
    enum: ['Notes', 'PYQs', 'Scheme'],
    required: true
  },
  schemeNo: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);