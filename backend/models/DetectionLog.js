import mongoose from 'mongoose';

const detectionLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  personDetected: { type: Boolean, default: false },
  plateDetected: { type: Boolean, default: false },
  name: { type: String, default: null },
  rollNo: { type: String, default: null },
  plateNumber: { type: String, default: null },
  image: { type: String }, // snapshot from camera
  objectDetected: [String], // e.g., ['helmet', 'bag']
  authenticated: { type: Boolean, default: false }
});

export default mongoose.model('DetectionLog', detectionLogSchema);
