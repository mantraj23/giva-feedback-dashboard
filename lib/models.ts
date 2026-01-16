import mongoose, { Schema } from 'mongoose';

const FeedbackSchema = new Schema({
  productId: { type: Number, required: true }, // CHANGED: String -> Number
  rating: { type: Number, required: true },
  text: { type: String, required: false },
  images: { type: [String], default: [] },
  sentiment: { type: String, enum: ['Positive', 'Negative', 'Neutral'], default: 'Neutral' },
  themes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Prevent overwrite error in Next.js hot reload
export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);