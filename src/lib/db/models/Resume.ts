import mongoose, { Schema, Model } from 'mongoose';

export interface IResumeVersion {
  content: string; // Markdown content or JSON structure
  feedback?: string; // AI feedback
  createdAt: Date;
}

export interface IResume extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  latestContent: string;
  versions: IResumeVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersion>({
  content: { type: String, required: true },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  latestContent: { type: String },
  versions: [ResumeVersionSchema],
}, { timestamps: true });

// Check if model exists to avoid recompilation errors in dev
const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume;
