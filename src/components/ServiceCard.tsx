import React from 'react';
import { ZiyaratService } from '../types';
import { Star, MessageSquare } from 'lucide-react';

interface ServiceCardProps {
  service: ZiyaratService & { score?: number };
  onClick: () => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  // Map Tailwind colors to hex for reliable inline styling if classes get purged
  const getGradientStyle = (gradientStr: string) => {
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
    const colors = colorMap[gradientStr] || ['#94a3b8', '#64748b'];
    return { background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})` };
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0"
            style={getGradientStyle(service.gradient)}
          >
            {service.emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-teal-500 transition-colors">{service.name}</h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{service.type}</span>
          </div>
        </div>
        
        {service.score !== undefined && service.score > 0 && (
          <span className="text-xs font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full shrink-0">
            {Math.round(service.score * 100)}% انطباق
          </span>
        )}
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 flex-grow">
        {service.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {service.tags.map(tag => (
          <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-sm font-medium">
          {service.rating !== undefined ? (
            <>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span>{service.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MessageSquare className="w-4 h-4" />
                <span>{service.reviewCount} تجربه</span>
              </div>
            </>
          ) : (
            <span className="text-slate-400 text-sm italic">جدید در ابزار زائر - بدون امتیاز</span>
          )}
        </div>
      </div>
    </div>
  );
}
