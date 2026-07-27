import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
        }, 30); // fast delete
      }
    } else {
      if (displayText.length === currentFullText.length) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // Wait before deleting
      } else {
        timeout = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
        }, 70); // typing speed
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, placeholderIndex]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-teal-500 flex items-start">
        <div className="pl-4 pr-1 pt-2 text-slate-400 shrink-0">
          {status === 'loading_model' ? (
             <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          ) : (
             <Search className="w-6 h-6" />
          )}
        </div>
        <div className="relative flex-1 h-32">
            <textarea
              dir="rtl"
              value={query}
              onChange={handleChange}
              className="absolute inset-0 w-full h-full bg-transparent outline-none text-lg text-slate-800 dark:text-slate-100 z-10 resize-none pt-2"
              placeholder=""
            />
            {!query && (
                <div dir="rtl" className="absolute inset-0 text-slate-400 pointer-events-none text-lg pt-2 break-words">
                    {displayText}
                    <span className="inline-block w-0.5 h-5 bg-teal-500 ml-1 animate-pulse align-middle"></span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
