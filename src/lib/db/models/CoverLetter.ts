import mongoose, { Schema, Model } from 'mongoose';

export interface ICoverLetter extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  jobDescription?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CoverLetterSchema = new Schema<ICoverLetter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String },
  content: { type: String, required: true },
}, { timestamps: true });

const CoverLetter: Model<ICoverLetter> = mongoose.models.CoverLetter || mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema);

export default CoverLetter;
