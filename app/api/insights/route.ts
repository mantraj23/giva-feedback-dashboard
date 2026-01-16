import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Feedback } from '@/lib/models';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) return NextResponse.json({ insights: [], stats: {} });

    // Fetch reviews for this Numeric Product ID
    const reviews = await Feedback.find({ productId: Number(productId) });

    // Initialize counters
    const stats: any = {
      Comfort: { pos: 0, neg: 0, total: 0 },
      Durability: { pos: 0, neg: 0, total: 0 },
      Appearance: { pos: 0, neg: 0, total: 0 }
    };

    // Calculate counts based on your DB data
    reviews.forEach(r => {
      if (Array.isArray(r.themes)) {
        r.themes.forEach((t: string) => {
          if (stats[t]) {
            stats[t].total++;
            if (r.sentiment === 'Positive') stats[t].pos++;
            if (r.sentiment === 'Negative') stats[t].neg++;
          }
        });
      }
    });

    const insights: string[] = [];

    // --- HARDCODED INSIGHT LOGIC ---

    // 1. Analyze Durability
    const dur = stats.Durability;
    if (dur.total > 0) {
      const negRate = (dur.neg / dur.total) * 100;
      if (negRate > 50) {
        insights.push(`⚠️ CRITICAL: ${Math.round(negRate)}% of durability feedback is negative. Customers are reporting breakage.`);
      } else if (dur.pos > dur.neg) {
        insights.push(`✅ Quality Assurance: Customers perceive this item as sturdy.`);
      }
    }

    // 2. Analyze Comfort
    const com = stats.Comfort;
    if (com.total > 0) {
      const negRate = (com.neg / com.total) * 100;
      if (negRate > 40) {
        insights.push(`💡 Design Fix Needed: ${Math.round(negRate)}% of users find this uncomfortable.`);
      } else if (com.pos > com.neg) {
        insights.push(`✨ Comfort Approved: The fit is well-received.`);
      }
    }

    // 3. Analyze Appearance
    const app = stats.Appearance;
    if (app.total > 0) {
      const negRate = (app.neg / app.total) * 100;
      if (negRate > 40) {
        insights.push(`📉 Finish Issue: ${Math.round(negRate)}% complaints about appearance.`);
      } else if (app.pos > app.neg) {
        insights.push(`💎 Aesthetic Winner: High praise for the design.`);
      }
    }

    // Fallbacks
    if (insights.length === 0 && reviews.length > 0) {
      insights.push("ℹ️ General feedback is neutral. No recurring defects detected.");
    }
    if (reviews.length === 0) {
      insights.push("ℹ️ No data available to generate insights.");
    }

    return NextResponse.json({ insights, stats });
  } catch (error: any) {
    console.error("❌ INSIGHTS API ERROR:", error.message);
    return NextResponse.json({ insights: ["Error loading insights"], stats: {} }, { status: 500 });
  }
}