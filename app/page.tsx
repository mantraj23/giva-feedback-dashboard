'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext'; 
import Navbar from '@/components/Navbar';
import FeedbackForm from '@/components/FeedbackForm';
import DashboardMetrics from '@/components/DashboardMetrics';
import ReviewList from '@/components/ReviewList';
import InsightPanel from '@/components/InsightPanel';
import PhotoGallery from '@/components/PhotoGallery'; // <--- IMPORT NEW COMPONENT

export default function Home() {
  const { theme } = useTheme(); 
  
  const [selectedProduct, setSelectedProduct] = useState<number>(101);
  const [reviews, setReviews] = useState<any[]>([]); 

  const reviewCount = reviews.length;
  
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1)
    : 0;

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/feedback?productId=${selectedProduct}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]); 
      }
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
      setReviews([]);
    }
  };

  useEffect(() => { fetchData(); }, [selectedProduct]);

  return (
    <main className={`min-h-screen transition-colors duration-300 pb-12 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (1/3 Width) --- */}
          <div className="lg:col-span-1 space-y-6">
            <FeedbackForm 
              selectedProduct={selectedProduct} 
              onProductChange={setSelectedProduct} 
              onSuccess={fetchData}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </div>

          {/* --- RIGHT COLUMN (2/3 Width) --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. Dashboard Metrics */}
            <DashboardMetrics reviews={reviews} />

            {/* 2. Split Row: Gallery/Reviews & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* LEFT SIDE OF SPLIT: Gallery + Reviews */}
              <div className="w-full flex flex-col">
                 {/* GALLERY COMPONENT (Placed Above Feedback) */}
                 <PhotoGallery reviews={reviews} />

                 {/* RECENT FEEDBACK (Only shows text-based reviews) */}
                 <ReviewList reviews={reviews} />
              </div>

              {/* RIGHT SIDE OF SPLIT: Insights */}
              <div className="w-full">
                <div className="mt-0"> 
                  <InsightPanel productId={String(selectedProduct)} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}