'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ReducedMotionContextType {
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined);

export function ReducedMotionProvider({ children }: { children: React.ReactNode }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check OS preference
    const osPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check local storage for user override
    const storedPref = localStorage.getItem('prefers-reduced-motion');
    
    const frameId = requestAnimationFrame(() => {
      setIsReducedMotion(storedPref !== null ? storedPref === 'true' : osPrefersReduced);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const toggleReducedMotion = () => {
    setIsReducedMotion((prev) => {
      const newValue = !prev;
      localStorage.setItem('prefers-reduced-motion', String(newValue));
      return newValue;
    });
  };

  return (
    <ReducedMotionContext.Provider value={{ isReducedMotion, toggleReducedMotion }}>
      <div 
        data-reduced-motion={isReducedMotion}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  const context = useContext(ReducedMotionContext);
  if (context === undefined) {
    throw new Error('useReducedMotion must be used within a ReducedMotionProvider');
  }
  return context;
}
