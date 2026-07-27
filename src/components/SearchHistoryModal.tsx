import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Clock, Trash2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSearch: (query: string) => void;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  date: string;
}

export function SearchHistoryModal({ isOpen, onClose, onSelectSearch }: SearchHistoryModalProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
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
      // Remove duplicates
      const uniqueItems = items.filter((v, i, a) => a.findIndex(t => (t.query === v.query)) === i).slice(0, 20);
      setHistory(uniqueItems);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
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
              <Clock className="w-5 h-5 text-teal-500" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                تاریخچه جستجوها
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
                برای مشاهده تاریخچه جستجو، لطفا وارد حساب کاربری شوید.
              </div>
            ) : loading ? (
              <div className="text-center text-slate-500 py-8">در حال بارگذاری...</div>
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
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
