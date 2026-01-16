'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Send, Loader2, Star, Camera, X } from 'lucide-react';

const PRODUCTS = [
  { 
    id: 101, 
    name: 'Sterling Silver Solitaire Ring', 
    price: '₹1,499', 
    desc: '925 Silver, adjustable size, high-polish rhodium finish.',
    image: 'https://www.giva.co/cdn/shop/products/R031_R054.jpg?v=1662372742&width=713' 
  },
  { 
    id: 102, 
    name: 'Rose Gold Heart Necklace', 
    price: '₹2,299', 
    desc: '18k Rose Gold plating with a minimal delicate chain.',
    image: 'https://www.giva.co/cdn/shop/files/PD0559_1.jpg?v=1711631327&width=713' 
  },
  { 
    id: 103, 
    name: 'Classic Pearl Stud Earrings', 
    price: '₹999', 
    desc: 'Freshwater cultured pearls with silver push-back backing.',
    image: 'https://www.giva.co/cdn/shop/files/ER001_1_79152b7d-6d68-4e89-9094-fc9737b18789.jpg?v=1742394292&width=713' 
  },
  { 
    id: 104, 
    name: 'Zirconia Tennis Bracelet', 
    price: '₹3,499', 
    desc: 'Sparkling cubic zirconia stones set in sterling silver.',
    image: 'https://www.giva.co/cdn/shop/files/BR0900_1.jpg?v=1711028177&width=713' 
  },
  { 
    id: 105, 
    name: 'Evil Eye Gold Anklet', 
    price: '₹1,199', 
    desc: 'Trendy protective charm anklet, perfect for daily wear.',
    image: 'https://www.giva.co/cdn/shop/files/A0282_2_0b46ad90-1ab7-4755-a326-fe785cb5358e.jpg?v=1765272153&width=713' 
  }
];

export default function FeedbackForm({ selectedProduct, onProductChange, onSuccess, averageRating, reviewCount }: any) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  const currentProductDetails = PRODUCTS.find(p => p.id === Number(selectedProduct));

  const getRatingColor = (score: number) => {
    if (!score) return theme === 'dark' ? 'text-gray-400' : 'text-gray-600'; // Darker gray for empty
    if (score < 2.0) return 'text-red-600'; // Darker Red
    if (score <= 3.4) return 'text-yellow-600'; // Darker Yellow
    if (score <= 4.0) return 'text-lime-600'; // Darker Lime
    return 'text-emerald-700 dark:text-emerald-400'; // Darker Green
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (selectedFiles.length + filesArray.length > 4) {
        alert("Max 4 photos allowed.");
        return;
      }
      setSelectedFiles(prev => [...prev, ...filesArray]);
      setPreviewUrls(prev => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];
    const uploadedUrls: string[] = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET || '');
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST', body: formData,
        });
        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      } catch (err) { console.error("Image upload failed:", err); }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      const imageUrls = await uploadImages();
      const reviewText = text.trim() === '' ? 'No written review' : text;
      
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: Number(selectedProduct), 
          rating, 
          text: reviewText, 
          images: imageUrls 
        }),
      });
      setText(''); setRating(0); setSelectedFiles([]); setPreviewUrls([]); onSuccess();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // --- DARKER TEXT STYLES ---
  const cardClass = theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const inputClass = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-white' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:ring-black';
  
  // CHANGED: text-gray-500 -> text-gray-800
  const labelClass = theme === 'dark' ? 'text-slate-300' : 'text-gray-800';
  const buttonClass = theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800';
  
  const uploadBoxClass = theme === 'dark' 
    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' 
    : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'; // Darker text inside box

  const productCardClass = theme === 'dark'
    ? 'bg-slate-800 border-slate-700'
    : 'bg-gray-50 border-gray-200';

  return (
    <div className={`p-6 rounded-xl border shadow-sm transition-colors duration-300 ${cardClass}`}>
      <h2 className="text-lg font-semibold mb-4">Submit Customer Review</h2>
      
      <div className="mb-4">
        <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>Product</label>
        
        <select 
          value={selectedProduct}
          onChange={(e) => onProductChange(Number(e.target.value))}
          className={`w-full mt-1 p-2 rounded-lg outline-none border focus:ring-2 mb-3 ${inputClass}`}
        >
          {PRODUCTS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* --- PRODUCT PREVIEW CARD --- */}
        {currentProductDetails && (
          <div className={`flex gap-3 p-3 rounded-lg border items-center animate-in fade-in slide-in-from-top-2 ${productCardClass}`}>
            <img 
              src={currentProductDetails.image} 
              alt={currentProductDetails.name} 
              className="w-14 h-14 rounded-md object-cover border border-gray-200/20 shadow-sm shrink-0"
            />
            <div className="flex flex-col gap-0.5 w-full">
                <div className="flex justify-between items-start w-full">
                  <h4 className={`text-sm font-bold leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {currentProductDetails.name}
                  </h4>
                  
                  {/* RATING & COUNT SECTION */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className={`font-bold text-sm ${getRatingColor(Number(averageRating))}`}>
                        {averageRating ? averageRating : 'New'}
                      </span>
                    </div>
                    {/* Review Count: Darkened to gray-600 */}
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">
                      {reviewCount || 0} reviews
                    </span>
                  </div>
                </div>
                
                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {currentProductDetails.price}
                </span>
                {/* Description: Darkened to gray-700 */}
                <p className={`text-[10px] leading-tight line-clamp-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>
                    {currentProductDetails.desc}
                </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>Rating</label>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button key={starValue} type="button" onClick={() => setRating(starValue)}>
                <Star className={`w-10 h-10 transition-colors ${
                  rating >= starValue ? 'fill-yellow-400 text-yellow-400' : (theme === 'dark' ? 'text-slate-700' : 'text-gray-300')
                }`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>Review</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your review here..." 
            className={`w-full mt-1 p-3 rounded-lg h-32 outline-none border resize-none focus:ring-2 ${inputClass}`}
          />
        </div>

        {/* --- SQUARE IMAGE UPLOAD UI --- */}
        <div>
          <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${labelClass}`}>Add Photos</label>
          
          <div className="flex flex-wrap gap-3">
            <label className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors border ${uploadBoxClass}`}>
              <Camera className="w-6 h-6 mb-1 opacity-70" />
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>

            {previewUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 group">
                <img 
                  src={url} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg border border-gray-200" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className={`text-xs mt-2 ${labelClass}`}>
            {selectedFiles.length}/4 images selected
          </div>
        </div>

        <button 
          disabled={loading || rating === 0} 
          className={`w-full font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50 ${buttonClass}`}
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Send className="w-4 h-4" /> Submit Review</>}
        </button>
      </form>
    </div>
  );
}