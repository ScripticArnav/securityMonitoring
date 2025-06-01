import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  hasVehicle: { type: Boolean, default: false },
  plateNumber: { type: String, default: null },
  type: { type: String, enum: ["bike", "car", "other"], default: null },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  images: [
    {
      name: { type: String, required: true },
      data: { type: String, required: true },
      contentType: { type: String },
    },
  ],
  vehicle: vehicleSchema,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
