'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { X, Image as ImageIcon } from 'lucide-react';

export default function PhotoGallery({ reviews }: { reviews: any[] }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Extract ALL images from ALL reviews into a single flat array
  const allImages = reviews.flatMap((r) => r.images || []);
  const totalPhotos = allImages.length;

  if (totalPhotos === 0) return null;

  // Show up to 4 thumbnails in the preview
  const previewImages = allImages.slice(0, 4);
  const remainingCount = totalPhotos - 4;

  // Styles
  const cardClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const overlayClass = theme === 'dark' ? 'bg-slate-950/90' : 'bg-black/80';
  const modalBg = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <>
      {/* --- PREVIEW STRIP --- */}
      <div className={`p-4 rounded-xl border shadow-sm mb-6 ${cardClass}`}>
        <div 
          className="flex items-center gap-2 mb-3 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <ImageIcon className={`w-4 h-4 ${textMain}`} /> 
          <h3 className={`font-bold text-sm ${textMain}`}>
             Customer Photos
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {previewImages.map((img, i) => (
            <div 
              key={i} 
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-100 dark:border-slate-800"
              onClick={() => setIsOpen(true)}
            >
              <img 
                src={img} 
                alt="Customer photo" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay for the 4th image if there are more */}
              {i === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[1px]">
                  +{remainingCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- POPUP MODAL --- */}
      {isOpen && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${overlayClass} backdrop-blur-sm animate-in fade-in duration-200`}>
          {/* Modal Container */}
          <div className={`relative w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${modalBg}`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-800">
              <h2 className={`text-lg font-bold ${textMain}`}>All Customer Photos ({totalPhotos})</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className={`w-5 h-5 ${textMain}`} />
              </button>
            </div>

            {/* Scrollable Grid */}
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allImages.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <img 
                      src={img} 
                      alt={`Gallery ${idx}`} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}