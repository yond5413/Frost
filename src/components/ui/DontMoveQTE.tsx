'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';

export default function DontMoveQTE() {
    const { qteActive, passQTE, failQTE, fearLevel } = useGameStore();
    const [timeLeft, setTimeLeft] = useState(5);
    const [isFailed, setIsFailed] = useState(false);
    const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
    
    const safeZoneSize = Math.max(60, 180 - fearLevel * 1.2);
    const timerDuration = Math.max(2, 5 - fearLevel / 30);

    useEffect(() => {
        if (!qteActive || isFailed) return;

        const initTimer = setTimeout(() => setTimeLeft(timerDuration), 0);

        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const halfSize = safeZoneSize / 2;
            
            if (
                e.clientX < centerX - halfSize ||
                e.clientX > centerX + halfSize ||
                e.clientY < centerY - halfSize ||
                e.clientY > centerY + halfSize
            ) {
                setIsFailed(true);
                setTimeout(() => failQTE(), 1200);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        const startShake = Date.now();
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startShake;
            const intensity = Math.min(8, elapsed / 200);
            setShakeOffset({
                x: (Math.random() - 0.5) * intensity,
                y: (Math.random() - 0.5) * intensity,
            });
        }, 30);

        const countdownTimer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    clearInterval(countdownTimer);
                    clearInterval(shakeInterval);
                    passQTE();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(initTimer);
            clearInterval(countdownTimer);
            clearInterval(shakeInterval);
            setShakeOffset({ x: 0, y: 0 });
        };
    }, [qteActive, fearLevel, isFailed, failQTE, passQTE, safeZoneSize, timerDuration]);

    useEffect(() => {
        if (!qteActive) {
            const timer = setTimeout(() => {
                setIsFailed(false);
                setShakeOffset({ x: 0, y: 0 });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [qteActive]);

    if (!qteActive) return null;

    const progressPercent = (timeLeft / timerDuration) * 100;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{
                transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
                transition: 'transform 0.03s ease-out',
            }}
        >
            <div className="absolute inset-0 bg-red-900/20 animate-pulse" />
            
            <div
                className={`absolute border-2 ${isFailed ? 'border-red-600 bg-red-900/60' : 'border-red-500/70 bg-red-900/20'} transition-all duration-150`}
                style={{
                    width: `${safeZoneSize}px`,
                    height: `${safeZoneSize}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isFailed 
                        ? '0 0 80px rgba(220,38,38,1), inset 0 0 30px rgba(220,38,38,0.5)' 
                        : '0 0 30px rgba(220,38,38,0.5), inset 0 0 15px rgba(220,38,38,0.3)',
                }}
            />
            
            {!isFailed && (
                <div 
                    className="absolute border-t-2 border-red-500"
                    style={{
                        width: `${safeZoneSize - 20}px`,
                        top: `${50 - (progressPercent / 2)}%`,
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0.6,
                    }}
                />
            )}

            <div className="absolute top-[15%] text-center">
                <h2 className={`text-7xl font-black uppercase tracking-[0.3em] ${isFailed ? 'text-red-600' : 'text-red-500'} animate-pulse`}>
                    {isFailed ? 'DETECTED' : "DON'T MOVE"}
                </h2>
                {!isFailed && (
                    <div className="mt-6">
                        <div className="w-64 h-3 bg-red-900/50 rounded-full overflow-hidden border border-red-700/50">
                            <div 
                                className="h-full bg-red-600 transition-all duration-100"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="text-red-400 mt-3 font-mono text-2xl">
                            {timeLeft.toFixed(1)}s
                        </p>
                    </div>
                )}
            </div>

            {isFailed && (
                <div className="absolute inset-0 bg-red-900/40 animate-pulse" />
            )}
        </div>
    );
}
