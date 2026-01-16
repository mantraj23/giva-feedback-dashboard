export interface IReview {
  _id: string;
  productId: string;
  rating: number;
  text: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  themes: string[];
  createdAt: string;
}