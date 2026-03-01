'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

export default function ButterflyNotification() {
    const activeConsequence = useGameStore((state) => state.activeConsequence);
    const clearActiveConsequence = useGameStore((state) => state.clearActiveConsequence);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (activeConsequence && activeConsequence.startsWith('butterfly_')) {
            const showTimer = setTimeout(() => setIsVisible(true), 0);
            const hideTimer = setTimeout(() => {
                setIsVisible(false);
                clearActiveConsequence();
            }, 5000);
            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [activeConsequence, clearActiveConsequence]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed top-20 left-10 z-50 flex items-center gap-4 bg-black/80 border-l-4 border-cyan-400 p-4 rounded-r-lg shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                >
                    <div className="w-12 h-12 flex items-center justify-center">
                        {/* Simple Animated Butterfly SVG */}
                        <motion.svg
                            viewBox="0 0 100 100"
                            className="w-10 h-10 text-cyan-400 fill-current"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotateY: [0, 45, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <path d="M50 50 C20 20 10 50 10 70 C10 90 30 90 50 70 C70 90 90 90 90 70 C90 50 80 20 50 50 Z" />
                        </motion.svg>
                    </div>
                    <div>
                        <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Butterfly Effect</h3>
                        <p className="text-white text-sm font-light">The butterfly effect has been updated.</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
