import React, { useEffect, useRef, useState, useMemo } from "react";

interface SlotProps {
  minDamage: number;
  maxDamage: number;
  duration: number;
  onComplete: (health: number, attack: number) => void;
}

export default function Slot({ minDamage, maxDamage, duration, onComplete }: SlotProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Simulate slot machine spinning
    setTimeout(() => {
      const health = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
      const attack = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
      setResult(health);
      setIsSpinning(false);
      onComplete(health, attack);
    }, duration);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={spin}
        disabled={isSpinning}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {isSpinning ? 'Spinning...' : 'Spin for Stats'}
      </button>
      {result !== null && (
        <div className="mt-4 text-xl font-bold">
          Health: {result}
        </div>
      )}
    </div>
  );
}