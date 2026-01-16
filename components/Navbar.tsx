'use client';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
        
        {/* LEFT: LOGO SECTION */}
        <div className="flex items-center gap-4">
          <Image 
            src="/logo.avif" 
            alt="GIVA Logo" 
            width={80}           
            height={32}           
            className="h-8 w-auto object-contain" 
            priority              
          />
        </div>

        {/* CENTER: TITLE (Absolutely centered) */}
        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-xl tracking-tight text-black hidden md:block">
          Customer Feedback Analyzer
        </span>

        {/* RIGHT: THEME TOGGLE */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-slate-600 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-orange-400" /> 
          ) : (
            <Moon className="w-5 h-5" /> 
          )}
        </button>

      </div>
    </nav>
  );
}