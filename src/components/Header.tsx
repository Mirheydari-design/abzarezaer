import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User as UserIcon, Settings, Plus } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenAddService?: () => void;
}

export function Header({ onOpenSettings, onOpenAddService }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="تنظیمات"
              title="تنظیمات"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-700 pr-4">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 hidden sm:block">
                ابزار زائر
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={onOpenAddService}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت پلتفرم</span>
              </button>
            )}

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 py-1.5 px-2 pr-4 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate" dir="ltr">
                  {user.displayName}
                </span>
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-1" title="خروج">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity text-sm"
              >
                <span>ورود / ثبت‌نام</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
