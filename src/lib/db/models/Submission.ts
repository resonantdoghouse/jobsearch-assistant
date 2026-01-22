import mongoose, { Schema, Model } from "mongoose";

export interface ISubmission extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: "Accepted" | "Failed";
  executionTime?: number;
  score?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ["Accepted", "Failed"], required: true },
    executionTime: { type: Number },
    score: { type: Number },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
  },
  { timestamps: true },
);

// Check if model exists to avoid recompilation errors in dev
const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;
