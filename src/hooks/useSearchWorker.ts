import { useState, useEffect, useRef, useCallback } from 'react';
import { ZiyaratService } from '../types';
import { MOCK_SERVICES } from '../data';
import localforage from 'localforage';
import { cosineSimilarity } from '../lib/utils';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export function useSearchWorker() {
    const worker = useRef<Worker | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading_model' | 'ready' | 'error'>('idle');
    const [progress, setProgress] = useState<any>(null);
    const [services, setServices] = useState<ZiyaratService[]>([]);
    
    // Callbacks for extract requests
    const extractResolvers = useRef<Record<string, (embedding: number[]) => void>>({});

    useEffect(() => {
        if (!worker.current) {
            // @ts-ignore - Vite worker import
            worker.current = new Worker(new URL('../lib/worker.ts', import.meta.url), {
                type: 'module'
            });

            worker.current.addEventListener('message', (e) => {
                const { status, data, error, id, embedding } = e.data;
                if (status === 'progress') setProgress(data);
                if (status === 'ready') setStatus('ready');
                if (status === 'error') setStatus('error');
                
                if (status === 'complete' && id && extractResolvers.current[id]) {
                    extractResolvers.current[id](embedding);
                    delete extractResolvers.current[id];
                }
            });

            // Start loading model
            setStatus('loading_model');
            worker.current.postMessage({ action: 'load' });
        }
        
        return () => {
            // Cleanup on unmount not strictly necessary for this singleton app
        };
    }, []);

    const extractEmbedding = useCallback((text: string): Promise<number[]> => {
        return new Promise((resolve) => {
            const id = Math.random().toString(36).substring(7);
            extractResolvers.current[id] = resolve;
            worker.current?.postMessage({ action: 'extract', text, id });
        });
    }, []);

    // Initialize data and compute embeddings if needed
    useEffect(() => {
        const initData = async () => {
            if (status !== 'ready') return;
            
            try {
                // Try to load cached services with embeddings
                const cached: ZiyaratService[] | null = await localforage.getItem('services_cache');
                
                // Fetch from Firestore
                const querySnapshot = await getDocs(collection(db, 'services'));
                const dbServices: ZiyaratService[] = [];
                querySnapshot.forEach((doc) => {
                    dbServices.push({ id: doc.id, ...doc.data() } as ZiyaratService);
                });

                // Merge
                const allServices = [...MOCK_SERVICES, ...dbServices].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);

                // Check if all have embeddings in cache
                if (cached && cached.length === allServices.length && cached.every(c => c.embedding)) {
                    setServices(cached);
                    return;
                }

                // Calculate embeddings for new ones
                const withEmbeddings = await Promise.all(allServices.map(async (service) => {
                    // find in cache first
                    const cachedSvc = cached?.find(c => c.id === service.id);
                    if (cachedSvc && cachedSvc.embedding) return cachedSvc;

                    const textToEmbed = `${service.name} ${service.description} ${service.tags?.join(' ') || ''}`;
                    const embedding = await extractEmbedding(textToEmbed);
                    return { ...service, embedding };
                }));

                setServices(withEmbeddings);
                await localforage.setItem('services_cache', withEmbeddings);
            } catch (error) {
                console.error("Error initializing services:", error);
            }
        };
        initData();
    }, [status, extractEmbedding]);

    const search = useCallback(async (query: string): Promise<ZiyaratService[]> => {
        if (!query.trim() || status !== 'ready' || services.length === 0) return services;
        
        const queryEmbedding = await extractEmbedding(query);
        
        const scored = services.map(service => {
            const score = cosineSimilarity(queryEmbedding, service.embedding!);
            return { ...service, score };
        });
        
        // Sort by similarity score descending
        scored.sort((a, b) => (b.score || 0) - (a.score || 0));
        return scored;
    }, [status, services, extractEmbedding]);

    return { status, progress, search, services };
}
