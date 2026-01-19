import mongoose, { Schema, Model } from 'mongoose';

export interface ICoverLetter extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  jobDescription?: string;
  content: string;
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoverLetterSchema = new Schema<ICoverLetter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescription: { type: String },
  content: { type: String, required: true },
  isStarred: { type: Boolean, default: false },
}, { timestamps: true });

const CoverLetter: Model<ICoverLetter> = mongoose.models.CoverLetter || mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema);

export default CoverLetter;
