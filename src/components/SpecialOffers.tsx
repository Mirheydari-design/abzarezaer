import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface SpecialOffersProps {
  onSelectOffer: (id: string) => void;
}

export function SpecialOffers({ onSelectOffer }: SpecialOffersProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const offers = [
    {
        "id": "24",
        "title": "پلتفرم راه زائر",
        "description": "دستیار هوشمند مسیر شامل اطلاع از وضعیت مرزها، اوقات شرعی و اشتراک‌گذاری لحظه‌ای وضعیت مسیر",
        "gradient": "from-fuchsia-400 to-violet-500",
        "tag": "دستیار جامع سفر",
        "link": "rahezaer.taavonafarin.ir"
    },
    {
        "id": "23",
        "title": "اپلیکیشن حساب زائر",
        "description": "محاسبه‌گر دقیق دینار به تومان؛ نمایش مبالغ به حروف و زبان عربی جهت نمایش به فروشنده",
        "gradient": "from-amber-400 to-orange-500",
        "tag": "ابزار مالی زائر",
        "link": "https://hesabezaer.taavonafarin.ir"
    },
    {
        "id": "3",
        "title": "خانه زیارت",
        "description": "پلتفرم هوشمند برای مقایسه کاروان‌های معتبر و مدیریت کمک‌های خیریه برای اعزام زائر اولی‌ها.",
        "gradient": "from-teal-400 to-emerald-500",
        "tag": "پلتفرم تسهیل‌گر",
        "link": "https://ziarathome.ir"
    }
];

  const getGradientStyle = (gradientStr: string) => {
    const colorMap: Record<string, string[]> = {
      'from-fuchsia-400 to-violet-500': ['#e879f9', '#8b5cf6'],
      'from-amber-400 to-orange-500': ['#fbbf24', '#f97316'],
      'from-teal-400 to-emerald-500': ['#2dd4bf', '#10b981'],
    };
    const colors = colorMap[gradientStr] || ['#3b82f6', '#4f46e5'];
    return { background: `linear-gradient(to left, ${colors[0]}, ${colors[1]})` };
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">پیشنهادهای ویژه</h3>
      </div>
      
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex touch-pan-y -ml-4">
          {offers.map((offer) => (
            <div key={offer.id} className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_80%] lg:flex-[0_0_60%]">
              <div
                className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md cursor-pointer group h-full flex flex-col justify-between"
                style={getGradientStyle(offer.gradient)}
                onClick={() => onSelectOffer(offer.id)}
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="relative z-10 flex-grow">
                  <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold mb-4 border border-white/20">
                    {offer.tag}
                  </span>
                  <h4 className="text-xl font-bold mb-2">{offer.title}</h4>
                  <p className="text-white/80 text-sm leading-relaxed max-w-sm mb-4">
                    {offer.description}
                  </p>
                </div>
                
                <div className="relative z-10 mt-auto flex items-center gap-1.5 text-sm font-bold group-hover:translate-x-[-8px] transition-transform">
                  <span>مشاهده جزئیات</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-2 mt-6">
        {offers.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'w-8 bg-teal-500' 
                : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
            }`}
            aria-label={`اسلاید ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
