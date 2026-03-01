'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastMessage {
    id: string;
    text: string;
    type: 'trait' | 'relationship';
}

let toastIdCounter = 0;
let globalAddToast: (text: string, type: 'trait' | 'relationship') => void = () => { };

export const notifyStatusUpdate = (text: string, type: 'trait' | 'relationship' = 'trait') => {
    globalAddToast(text, type);
};

export default function StatusUpdateToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        globalAddToast = (text, type) => {
            const id = (toastIdCounter++).toString();
            setToasts((prev) => [...prev, { id, text, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        };
    }, []);

    return (
        <div className="fixed top-10 right-10 z-50 flex flex-col gap-2 items-end pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className={`px-4 py-2 rounded border-r-4 shadow-lg flex items-center gap-3 backdrop-blur-md ${toast.type === 'trait'
                                ? 'bg-slate-900/80 border-white text-white'
                                : 'bg-indigo-950/80 border-indigo-400 text-indigo-100'
                            }`}
                    >
                        <span className="text-xs font-bold uppercase tracking-tighter">Status Update</span>
                        <span className="text-sm font-medium">{toast.text}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
