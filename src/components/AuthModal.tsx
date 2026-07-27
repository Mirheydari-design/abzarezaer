import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('نام کاربری و رمز عبور الزامی است.');
      return;
    }
    if (username.includes(' ') || username.includes('@')) {
      setError('نام کاربری نباید شامل فاصله یا @ باشد.');
      return;
    }

    setLoading(true);
    setError('');

    const email = `${username.toLowerCase()}@ziyaratyar.app`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        // Register: Check uniqueness first
        const userRef = doc(db, 'users', username.toLowerCase());
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setError('این نام کاربری قبلاً ثبت شده است.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Save to users collection
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          username: username.toLowerCase(),
          displayName: username,
          createdAt: new Date().toISOString()
        });

        await updateProfile(userCredential.user, {
          displayName: username
        });
        
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('این نام کاربری قبلاً ثبت شده است.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('نام کاربری یا رمز عبور اشتباه است.');
      } else if (err.code === 'auth/weak-password') {
        setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      } else {
        setError('خطایی رخ داد. لطفا دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isLogin ? 'ورود به حساب کاربری' : 'ثبت‌نام'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نام کاربری (انگلیسی)
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                placeholder="username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رمز عبور
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-800 dark:text-white"
                placeholder="********"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'ورود' : 'ثبت‌نام')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
