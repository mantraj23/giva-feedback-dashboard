'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ChevronDown, MessageSquare, X, Maximize2 } from 'lucide-react';

export default function ReviewList({ reviews }: { reviews: any[] }) {
  const { theme } = useTheme();
  const [visibleCount, setVisibleCount] = useState(5);
  
  // State for the Review Popup
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  
  // Filter: Hide reviews with no text or "No written review"
  const filteredReviews = safeReviews.filter((r: any) => 
    r.text && 
    r.text.trim().length > 0 && 
    r.text !== 'No written review'
  );

  const displayedReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  // --- HELPER: Get Color for Sentiment ---
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return theme === 'dark' 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Negative':
        return theme === 'dark' 
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
          : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return theme === 'dark' 
          ? 'bg-slate-800 text-slate-400 border-slate-700' 
          : 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // --- STYLES ---
  const cardClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-slate-400' : 'text-gray-500';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-gray-100';
  const buttonClass = theme === 'dark' 
    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
    : 'text-gray-600 hover:bg-gray-50 hover:text-black';
  const overlayClass = theme === 'dark' ? 'bg-slate-950/90' : 'bg-black/80';
  const modalBg = theme === 'dark' ? 'bg-slate-900' : 'bg-white';

  if (filteredReviews.length === 0) {
    return (
      <div className={`p-6 rounded-xl border shadow-sm h-full flex flex-col items-center justify-center text-center min-h-[200px] ${cardClass}`}>
        <div className={`p-4 rounded-full mb-3 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
          <MessageSquare className={`w-6 h-6 ${textSub}`} />
        </div>
        <p className={`text-sm ${textSub}`}>No written reviews yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`p-6 rounded-xl border shadow-sm h-full flex flex-col ${cardClass}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${textMain}`}>Recent Feedback</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
            {filteredReviews.length} total
          </span>
        </div>

        <div className="flex-1 space-y-4">
          {displayedReviews.map((r: any, i: number) => (
            <div key={i} className={`pb-4 border-b last:border-0 last:pb-0 ${borderClass}`}>
              
              {/* Header: User, Stars, and Sentiment Badge */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                    U{i + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${textMain}`}>Verified Buyer</div>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Star Rating */}
                      <div className="flex text-yellow-400 text-[10px]">
                        {'★'.repeat(r.rating || 0)}
                        <span className="text-gray-300">{'★'.repeat(5 - (r.rating || 0))}</span>
                      </div>
                      
                      {/* SENTIMENT BADGE (New) */}
                      <span className={`text-[9px] px-1.5 py-0 rounded border uppercase font-bold tracking-wide ${getSentimentBadge(r.sentiment)}`}>
                        {r.sentiment || 'Neutral'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] ${textSub}`}>
                  {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <p className={`text-sm leading-relaxed mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                {r.text}
              </p>

              {/* Thumbnail List */}
              {r.images && r.images.length > 0 && (
                <div className="flex gap-2">
                  {r.images.map((img: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedReview(r)} 
                    >
                      <img 
                        src={img} 
                        alt="Review attachment" 
                        className={`w-12 h-12 rounded-lg object-cover border transition-transform group-hover:scale-105 ${borderClass}`} 
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Theme Tags */}
              {r.themes && r.themes.length > 0 && (
                 <div className="flex flex-wrap gap-1.5 mt-2">
                   {r.themes.map((t: string, ti: number) => (
                     <span key={ti} className={`text-[10px] px-1.5 py-0.5 rounded border ${theme === 'dark' ? 'border-slate-700 text-slate-400 bg-slate-800' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                       {t}
                     </span>
                   ))}
                 </div>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <button 
            onClick={handleLoadMore}
            className={`w-full mt-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition-colors ${buttonClass}`}
          >
            Show more reviews <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* --- REVIEW DETAILS POPUP --- */}
      {selectedReview && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${overlayClass} backdrop-blur-sm animate-in fade-in duration-200`}>
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] ${modalBg}`}>
            
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                  U
                </div>
                <div>
                  <h3 className={`text-base font-bold ${textMain}`}>Verified Buyer Review</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="flex text-yellow-400 text-xs">
                        {'★'.repeat(selectedReview.rating || 0)}
                        <span className="text-gray-300">{'★'.repeat(5 - (selectedReview.rating || 0))}</span>
                     </div>
                     {/* Sentiment Badge in Popup too */}
                     <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wide ${getSentimentBadge(selectedReview.sentiment)}`}>
                        {selectedReview.sentiment || 'Neutral'}
                     </span>
                     <span className={`text-xs ${textSub}`}>
                        • {new Date(selectedReview.createdAt || Date.now()).toLocaleDateString()}
                     </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className={`w-5 h-5 ${textMain}`} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              <p className={`text-base leading-relaxed mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                {selectedReview.text}
              </p>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h4 className={`text-xs font-bold uppercase mb-3 ${textSub}`}>Attached Photos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedReview.images.map((img: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-gray-200 dark:border-slate-700"
                        onClick={() => setFullScreenImage(img)}
                      >
                        <img 
                          src={img} 
                          alt="Full detail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- FULL SCREEN IMAGE MODAL --- */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFullScreenImage(null)}
        >
          <button 
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={fullScreenImage} 
            alt="Full screen" 
            className="max-w-full max-h-full rounded-md shadow-2xl"
          />
        </div>
      )}
    </>
  );
}