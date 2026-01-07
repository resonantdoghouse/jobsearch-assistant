import mongoose, { Schema, Model } from 'mongoose';

export interface IResumeAnalysis extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  fileName?: string;
  originalText: string;
  analysis: string;
  createdAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String },
  originalText: { type: String, required: true },
  analysis: { type: String, required: true },
}, { timestamps: true });

const ResumeAnalysis: Model<IResumeAnalysis> = mongoose.models.ResumeAnalysis || mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);

export default ResumeAnalysis;
