import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Search } from 'lucide-react';
import { motion } from 'motion/react';

const searchNeeds = [
  "نیاز به اقامتگاه خانوادگی نزدیک حرم دارم...",
  "خرید بلیط قطار و هواپیما با قیمت مناسب...",
  "دنبال همسفر برای سفر به کربلا می‌گردم...",
  "درخواست ویلچر برای افراد سالمند در حرم...",
  "خرید سوغات مشهد و زعفران با ارسال رایگان..."
];

interface TypewriterSearchBoxProps {
  onSearch: (query: string) => void;
  status: string;
}

export function TypewriterSearchBox({ onSearch, status }: TypewriterSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const currentFullText = searchNeeds[placeholderIndex];
    
    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % searchNeeds.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length - 1));
        }, 30);
      }
    } else {
      if (displayText.length === currentFullText.length) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 3000);
      } else {
        timeout = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
        }, 60);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, placeholderIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto group z-10" dir="rtl">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      
      <div 
        onClick={handleContainerClick}
        className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col transition-all cursor-text focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500/50 overflow-hidden"
      >
        <div className="flex-1 relative h-24 mb-4">
          <textarea
            ref={inputRef}
            value={query}
            onChange={handleChange}
            className="w-full h-full bg-transparent outline-none text-lg text-slate-800 dark:text-slate-100 z-10 resize-none leading-relaxed"
          />
          {!query && (
            <div className="absolute top-0 right-0 left-0 bottom-0 pointer-events-none text-lg text-slate-400 leading-relaxed text-right">
              <span>{displayText}</span>
              <span className="inline-block w-0.5 h-5 bg-teal-500 mr-1 animate-pulse align-middle"></span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'loading_model' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-600 dark:text-teal-400 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">در حال راه‌اندازی هوش مصنوعی</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium shadow-md">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">مبتنی بر هوش مصنوعی</span>
              </div>
            )}
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
