import mongoose from "mongoose";

const SavedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: String, // ID from the external source (e.g. LinkedIn/Indeed ID)
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: ["linkedin", "indeed"],
    },
    date: {
      type: String,
    },
    score: {
      type: Number,
    },
    matchReason: {
      type: String,
    },
  },
  { timestamps: true },
);

// Prevent re-compilation of the model if it already exists
export default mongoose.models.SavedJob ||
  mongoose.model("SavedJob", SavedJobSchema);
