import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Clock, Trash2, Settings, User as UserIcon, Lock, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSearch: (query: string) => void;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  date: string;
}

export function SettingsModal({ isOpen, onClose, onSelectSearch }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'profile'>('history');
  
  // History state
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      loadHistory();
      setDisplayName(auth.currentUser.displayName || '');
      setMessage({ text: '', type: '' });
      setPassword('');
    }
  }, [isOpen, activeTab]);

  const loadHistory = async () => {
    if (!auth.currentUser) return;
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, 'search_history'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const items: SearchHistoryItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as SearchHistoryItem);
      });
      const uniqueItems = items.filter((v, i, a) => a.findIndex(t => (t.query === v.query)) === i).slice(0, 20);
      setHistory(uniqueItems);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'search_history', id));
      setHistory(history.filter(h => h.id !== id));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setProfileLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (displayName && displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }
      
      if (password) {
        await updatePassword(auth.currentUser, password);
        setPassword('');
      }
      
      setMessage({ text: 'تنظیمات با موفقیت به‌روزرسانی شد.', type: 'success' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ text: 'برای تغییر رمز عبور، لطفا از حساب خارج شده و دوباره وارد شوید.', type: 'error' });
      } else {
        setMessage({ text: 'خطا در به‌روزرسانی اطلاعات.', type: 'error' });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-teal-500" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                تنظیمات
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              تاریخچه جستجو
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              حساب کاربری
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
            {!auth.currentUser ? (
              <div className="text-center text-slate-500 py-8">
                برای دسترسی به تنظیمات، لطفا وارد حساب کاربری شوید.
              </div>
            ) : activeTab === 'history' ? (
              historyLoading ? (
                <div className="text-center text-slate-500 py-8 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                  در حال بارگذاری...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  تاریخچه جستجوی شما خالی است.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        onSelectSearch(item.query);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {item.query}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {message.text}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نام کاربری
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                      placeholder="نام کاربری شما"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رمز عبور جدید (اختیاری)
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ذخیره تغییرات'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
