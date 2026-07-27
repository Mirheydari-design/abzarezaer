import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { TypewriterSearchBox } from './components/TypewriterSearchBox';
import { ServiceCard } from './components/ServiceCard';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { SpecialOffers } from './components/SpecialOffers';
import { SearchHistoryModal } from './components/SearchHistoryModal';
import { AddServiceModal } from './components/AddServiceModal';
import { useSearchWorker } from './hooks/useSearchWorker';
import { motion, AnimatePresence } from 'motion/react';
import { ZiyaratService } from './types';
import { auth, db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function App() {
  const { search, status, services } = useSearchWorker();
  const [results, setResults] = useState<ZiyaratService[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedService, setSelectedService] = useState<ZiyaratService | null>(null);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  // Initialize with all services when ready
  useEffect(() => {
    if (status === 'ready') {
      setResults(services);
    }
  }, [status, services]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults(services);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const matches = await search(query);
    setResults(matches);

    // Save search history
    if (auth.currentUser && query.trim().length > 2) {
      try {
        await addDoc(collection(db, 'search_history'), {
          userId: auth.currentUser.uid,
          query: query.trim(),
          date: new Date().toISOString()
        });
      } catch (error) {
         console.error('Error saving search history:', error);
      }
    }
  };

  const handleAddServiceSuccess = () => {
    // Optionally trigger a reload or show a success message
    // A full reload would be ideal to re-fetch the services and update the worker embeddings
    window.location.reload();
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 selection:bg-teal-500/30 transition-colors duration-300" dir="rtl">
        <Header 
          onOpenSettings={() => setIsSearchHistoryOpen(true)}
          onOpenAddService={() => setIsAddServiceOpen(true)}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-l from-slate-900 to-slate-600 dark:from-white dark:to-slate-400"
            >
              هوشمندانه زیارت کنید
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 dark:text-slate-400 mb-12"
            >
              بهترین خدمات اقامتی، حمل و نقل و راهنمای زیارت را بر اساس نیاز واقعی خود پیدا کنید. موتور جستجوی هوشمند ما، نیاز شما را درک می‌کند.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
               <TypewriterSearchBox onSearch={handleSearch} status={status} />
            </motion.div>
          </div>

          {!isSearching && <SpecialOffers />}

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {isSearching ? 'نتایج جستجو' : 'همه پلتفرم‌ها'}
              </h3>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {results.length}
              </span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
            >
              {results.map((service, index) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ServiceCard service={service} onClick={() => setSelectedService(service)} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {results.length === 0 && status === 'ready' && !isSearching && (
            <div className="text-center py-24 text-slate-500">
              <p className="text-xl">خدمتی یافت نشد.</p>
            </div>
          )}
        </main>

        <ServiceDetailModal 
          service={selectedService} 
          isOpen={!!selectedService} 
          onClose={() => setSelectedService(null)} 
        />
        
        <SearchHistoryModal
          isOpen={isSearchHistoryOpen}
          onClose={() => setIsSearchHistoryOpen(false)}
          onSelectSearch={handleSearch}
        />

        <AddServiceModal
          isOpen={isAddServiceOpen}
          onClose={() => setIsAddServiceOpen(false)}
          onSuccess={handleAddServiceSuccess}
        />
      </div>
    </ThemeProvider>
  );
}

