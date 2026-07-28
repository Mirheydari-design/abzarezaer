import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MessageSquare, ExternalLink, ShieldCheck, User as UserIcon, Send } from 'lucide-react';
import { ZiyaratService, Review } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';

interface ServiceDetailModalProps {
  service: ZiyaratService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && service) {
      loadReviews(service.id);
    } else {
      setReviews([]);
    }
  }, [isOpen, service]);

  const loadReviews = async (serviceId: string) => {
    setLoadingReviews(true);
    try {
      const q = query(
        collection(db, 'reviews'),
        where('serviceId', '==', serviceId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      let fetchedReviews: Review[] = [];
      snapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      
      if (serviceId === '23' && fetchedReviews.length === 0) {
        fetchedReviews = [
          {
            id: 'mock-1',
            serviceId: '23',
            userId: 'm1',
            userName: 'علی احمدی',
            comment: 'خیلی برنامه خوب و کاربردی بود، توی عراق برای حساب کتاب خیلی به دردم خورد.',
            date: new Date(Date.now() - 100000).toISOString()
          },
          {
            id: 'mock-2',
            serviceId: '23',
            userId: 'm2',
            userName: 'حسین محمدی',
            comment: 'عالی بود، مخصوصا اینکه به حروف عربی هم مبلغ رو مینویسه خیلی کار راه اندازه.',
            date: new Date(Date.now() - 200000).toISOString()
          },
          {
            id: 'mock-3',
            serviceId: '23',
            userId: 'm3',
            userName: 'زهرا کاظمی',
            comment: 'مبدل دینار به تومنش خیلی دقیق و سریع کار میکرد. ممنون از سازنده.',
            date: new Date(Date.now() - 300000).toISOString()
          }
        ];
      }
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !service || !auth.currentUser) return;
    
    setSubmitting(true);
    try {
      const reviewData: Omit<Review, 'id'> = {
        serviceId: service.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'کاربر',
        comment: newComment.trim(),
        date: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      setReviews([{ id: docRef.id, ...reviewData }, ...reviews]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
    <AnimatePresence>
      {isOpen && service && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl overflow-hidden flex flex-col pointer-events-auto border border-slate-200 dark:border-slate-800"
              dir="rtl"
            >
              <div className="flex justify-between items-start p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md shrink-0 text-white"
                    style={getGradientStyle(service.gradient, service.id)}
                  >
                    {service.emoji || service.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{service.name}</h2>
                      <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{service.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      {service.reviewCount !== undefined ? (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MessageSquare className="w-4 h-4" />
                          <span>{service.reviewCount} نظر کاربران</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">جدید در ابزار زائر - بدون نظر</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto custom-scrollbar flex-grow">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">درباره این ابزار</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                    {service.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ویژگی‌های برجسته</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-xl">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {['3', '23', '24'].includes(service.id) && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-4 mb-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">تایید شده توسط ابزار زائر</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        این پلتفرم از نظر کیفیت خدمات و رضایت کاربران مورد تایید می‌باشد.
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">نظرات کاربران</h3>
                  
                  {auth.currentUser ? (
                    <form onSubmit={handleSubmitReview} className="mb-8 flex gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 font-bold"
                        style={getGradientStyle('', auth.currentUser.displayName || auth.currentUser.uid)}
                      >
                        {(auth.currentUser.displayName || 'ک').charAt(0)}
                      </div>
                      <div className="flex-grow flex gap-2 min-w-0">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="تجربه خود را بنویسید..."
                          className="flex-grow min-w-0 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 dark:text-white"
                        />
                        <button 
                          type="submit"
                          disabled={!newComment.trim() || submitting}
                          className="px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                        >
                          <Send className="w-5 h-5 rtl:rotate-180" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-sm text-slate-600 dark:text-slate-400">
                      برای ثبت نظر باید وارد حساب کاربری خود شوید.
                    </div>
                  )}

                  <div className="space-y-4">
                    {loadingReviews ? (
                      <div className="text-center text-slate-500">در حال بارگذاری...</div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 text-sm font-bold"
                              style={getGradientStyle('', review.userName)}
                            >
                              {review.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800 dark:text-white">{review.userName}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(review.date).toLocaleDateString('fa-IR')}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-11">
                            {review.comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-sm">هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهد!</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0">
                <button 
                  onClick={() => service.link && window.open(service.link, '_blank')}
                  className="flex items-center gap-2 bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transform hover:-translate-y-0.5"
                >
                  <span>ورود به {service.type}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
