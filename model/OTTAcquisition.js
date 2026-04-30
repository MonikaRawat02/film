import mongoose from "mongoose";

const OTTAcquisitionSchema = new mongoose.Schema(
  {
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: "OTTPlatform", required: true },
    title: { type: String, required: true },
    language: { type: String },
    dealValue: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.OTTAcquisition || mongoose.model("OTTAcquisition", OTTAcquisitionSchema);
