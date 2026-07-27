import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const gradients = [
  'from-blue-400 to-indigo-500',
  'from-sky-400 to-cyan-500',
  'from-purple-400 to-pink-500',
  'from-teal-400 to-emerald-500',
  'from-rose-400 to-red-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-violet-500',
  'from-emerald-400 to-green-500',
];

const typeToEmoji: Record<string, string[]> = {
  'اقامت و هتل': ['🏨', '🛏️', '🏠', '🏢', '🏡'],
  'حمل و نقل': ['✈️', '🚂', '🚌', '🚕', '🚗'],
  'راهنمای زیارت': ['🗺️', '🧭', '🕌', '📖', '🕋'],
  'درمانی': ['🏥', '💊', '🩺', '🚑', '👨‍⚕️'],
  'موکب': ['⛺', '🍵', '🍛', '🤝', '❤️'],
  'فروشگاه': ['🎁', '🛍️', '💍', '📿', '🛒'],
  'سایر': ['✨', '🌟', '💫', '📌', '💡']
};

export function AddServiceModal({ isOpen, onClose, onSuccess }: AddServiceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('اقامت و هتل');
  const [emoji, setEmoji] = useState('🏨');
  const [tags, setTags] = useState('');
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setType(newType);
    const emojis = typeToEmoji[newType] || typeToEmoji['سایر'];
    setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('لطفا نام و توضیحات را وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedTags = tags.split('،').map(t => t.trim()).filter(t => t);
      const gradient = gradients[Math.floor(Math.random() * gradients.length)];

      await addDoc(collection(db, 'services'), {
        name,
        description,
        type,
        emoji,
        tags: parsedTags,
        gradient,
        reviewCount: 0,
        authorId: auth.currentUser?.uid,
        createdAt: new Date().toISOString()
      });

      onSuccess();
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setTags('');
    } catch (err) {
      console.error(err);
      setError('خطایی در ثبت اطلاعات رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  const types = ['اقامت و هتل', 'حمل و نقل', 'راهنمای زیارت', 'درمانی', 'موکب', 'فروشگاه', 'سایر'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={onClose}
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-500" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                ثبت پلتفرم یا خدمات جدید
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
            {!auth.currentUser ? (
              <div className="text-center text-slate-500 py-8">
                برای ثبت خدمات جدید، لطفا وارد حساب کاربری خود شوید.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نام پلتفرم / موکب
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                    placeholder="مثال: موکب امام رضا (ع)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      دسته‌بندی
                    </label>
                    <select
                      value={type}
                      onChange={handleTypeChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white appearance-none"
                    >
                      {types.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      ایموجی نماد
                    </label>
                    <input 
                      type="text" 
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                      placeholder="🏨"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    توضیحات
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white resize-none"
                    placeholder="توضیحات کامل درباره خدمات..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    برچسب‌ها (با ویرگول جدا کنید)
                  </label>
                  <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                    placeholder="اسکان رایگان، وعده غذایی، اینترنت"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-4 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ثبت خدمات'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
