import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Feedback } from '@/lib/models';
import { analyzeFeedback } from '@/lib/analyzer'; // Importing your custom analyzer

export async function POST(req: Request) {
  try {
    await connectDB();
    const { productId, rating, text, images } = await req.json();

    // 1. Run your custom analysis logic
    const analysis = analyzeFeedback(text || "");

    // 2. Create the record in MongoDB
    const newFeedback = await Feedback.create({
      productId: Number(productId), // Store as Number
      rating,
      text,
      images: images || [],
      sentiment: analysis.sentiment, // From your analyzer
      themes: analysis.themes,       // From your analyzer
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error: any) {
    console.error("❌ API POST ERROR:", error.message);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    // Query using Numeric ID
    const query = productId ? { productId: Number(productId) } : {};
    
    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    return NextResponse.json(feedback || []);
  } catch (error: any) {
    console.error("❌ API GET ERROR:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}