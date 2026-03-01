'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';

export default function DontMoveQTE() {
    const { qteActive, passQTE, failQTE, fearLevel } = useGameStore();
    const [timeLeft, setTimeLeft] = useState(5); // Baseline 5 seconds
    const [isFailed, setIsFailed] = useState(false);

    // Shrink the safe zone based on how high the fear level is
    const safeZoneSize = Math.max(80, 200 - fearLevel);

    useEffect(() => {
        if (!qteActive || isFailed) return;

        // Reset timer when QTE starts
        setTimeLeft(5 + (fearLevel / 50));

        const handleMouseMove = (e: MouseEvent) => {
            // Get exact center of the screen
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Calculate bounds
            const halfSize = safeZoneSize / 2;
            const leftBound = centerX - halfSize;
            const rightBound = centerX + halfSize;
            const topBound = centerY - halfSize;
            const bottomBound = centerY + halfSize;

            // Fail condition
            if (
                e.clientX < leftBound ||
                e.clientX > rightBound ||
                e.clientY < topBound ||
                e.clientY > bottomBound
            ) {
                setIsFailed(true);
                setTimeout(() => failQTE(), 1000); // 1 sec delay to show failure
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Timer countdown
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    passQTE();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(timer);
        };
    }, [qteActive, fearLevel, isFailed, failQTE, passQTE, safeZoneSize]);

    // Reset state when QTE deactivates
    useEffect(() => {
        if (!qteActive) {
            setIsFailed(false);
        }
    }, [qteActive]);

    if (!qteActive) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Terrifying overlay */}
            <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />

            {/* Safe Zone Visualizer */}
            <div
                className={`absolute border-2 ${isFailed ? 'border-red-600 bg-red-900/40' : 'border-white/50 bg-white/5'} transition-colors duration-100`}
                style={{
                    width: `${safeZoneSize}px`,
                    height: `${safeZoneSize}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isFailed ? '0 0 50px rgba(220,38,38,0.8)' : '0 0 20px rgba(255,255,255,0.2)'
                }}
            />

            <div className="absolute top-1/4 text-center">
                <h2 className={`text-6xl font-black uppercase tracking-[0.2em] ${isFailed ? 'text-red-600' : 'text-white'} animate-pulse`}>
                    {isFailed ? 'DETECTED' : "DON'T MOVE"}
                </h2>
                {!isFailed && (
                    <p className="text-white mt-4 font-mono text-xl">
                        {(Math.max(0, timeLeft)).toFixed(1)}s
                    </p>
                )}
            </div>

        </div >
    );
}
