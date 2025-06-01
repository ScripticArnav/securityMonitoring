import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  reason: { type: String, required: true }, // like: "Unknown Face", "Unauthorized Vehicle"
  image: { type: String }, // image for evidence
  details: {
    face: { type: Boolean, default: false },
    plate: { type: Boolean, default: false },
    matched: { type: Boolean, default: false }
  }
});

export default mongoose.model('NotificationLog', notificationLogSchema);
