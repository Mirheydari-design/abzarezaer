import React from 'react';
import { ZiyaratService } from '../types';
import { Star, MessageSquare } from 'lucide-react';

interface ServiceCardProps {
  service: ZiyaratService & { score?: number };
  onClick: () => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  // Map Tailwind colors to hex for reliable inline styling if classes get purged
  const getGradientStyle = (gradientStr: string, id: string) => {
    const colorMap: Record<string, string[]> = {
      'from-blue-400 to-indigo-500': ['#60a5fa', '#6366f1'],
      'from-sky-400 to-cyan-500': ['#38bdf8', '#06b6d4'],
      'from-purple-400 to-pink-500': ['#c084fc', '#ec4899'],
      'from-teal-400 to-emerald-500': ['#2dd4bf', '#10b981'],
      'from-rose-400 to-red-500': ['#fb7185', '#ef4444'],
      'from-amber-400 to-orange-500': ['#fbbf24', '#f97316'],
      'from-fuchsia-400 to-violet-500': ['#e879f9', '#8b5cf6'],
      'from-emerald-400 to-green-500': ['#34d399', '#22c55e'],
      'from-teal-500 to-emerald-600': ['#14b8a6', '#059669'],
    };
    
    const fallbacks = [
      ['#f472b6', '#db2777'],
      ['#818cf8', '#4f46e5'],
      ['#34d399', '#059669'],
      ['#fb923c', '#ea580c'],
      ['#a78bfa', '#7c3aed'],
      ['#38bdf8', '#0284c7'],
    ];

    if (gradientStr && colorMap[gradientStr]) {
       const colors = colorMap[gradientStr];
       return { background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})` };
    }
    
    // deterministic fallback based on id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = fallbacks[hash % fallbacks.length];
    return { background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})` };
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:border-teal-500/30 dark:hover:border-teal-500/30 cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0 text-white"
            style={getGradientStyle(service.gradient, service.id)}
          >
            {service.emoji || service.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-teal-500 transition-colors">{service.name}</h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{service.type}</span>
          </div>
        </div>
        
        {service.score !== undefined && service.score > 0 && (
          <span className="text-[11px] font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-md shrink-0">
            {Math.round(service.score * 100)}% انطباق
          </span>
        )}
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-grow">
        {service.description}
      </p>
      
      <div className="flex flex-wrap gap-1.5 mb-4">
        {service.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[11px] bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">
            {tag}
          </span>
        ))}
        {service.tags.length > 3 && (
          <span className="text-[11px] font-bold text-slate-400 px-1 py-1">
            +{service.tags.length - 3}
          </span>
        )}
      </div>
      
      <div className="flex items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className="flex items-center gap-3 text-xs font-medium">
          {service.reviewCount !== undefined ? (
            <div className="flex items-center gap-1 text-slate-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{service.reviewCount} تجربه</span>
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic">جدید - بدون تجربه</span>
          )}
        </div>
      </div>
    </div>
  );
}
