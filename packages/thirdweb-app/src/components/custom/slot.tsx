import React, { useEffect, useRef, useState, useMemo } from "react";

interface AttackDamageSlotProps {
  minDamage: number;
  maxDamage: number;
  duration?: number;
  onComplete?: (damage: number) => void;
}

export default function AttackDamageSlot({ 
  minDamage, 
  maxDamage, 
  duration = 3000,
  onComplete 
}: AttackDamageSlotProps) {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedDamage, setSelectedDamage] = useState<number | null>(null);
  const itemHeight = useRef<number>(100); // Default height
  
  // Generate damage values divisible by 10 within range
  const damageValues = useMemo(() => {
    // Ensure min and max are divisible by 10
    const normalizedMin = Math.ceil(minDamage / 10) * 10;
    const normalizedMax = Math.floor(maxDamage / 10) * 10;
    
    const values: string[] = [];
    for (let i = normalizedMin; i <= normalizedMax; i += 10) {
      values.push(i.toString());
    }
    return values;
  }, [minDamage, maxDamage]);
  
  // Randomly select a target damage value
  const getRandomDamage = () => {
    const randomIndex = Math.floor(Math.random() * damageValues.length);
    return {
      value: parseInt(damageValues[randomIndex]),
      index: randomIndex
    };
  };
  
  const startSpin = () => {
    if (spinning || !slotRef.current) return;
    
    setSpinning(true);
    setSelectedDamage(null);
    
    // Get target damage value
    const { value, index } = getRandomDamage();
    
    // Ensure we get the correct height dynamically
    const firstItem = slotRef.current.children[0] as HTMLElement | null;
    itemHeight.current = firstItem ? firstItem.clientHeight : 100;
    
    // Reset position before spinning
    slotRef.current.style.transition = 'none';
    slotRef.current.style.transform = 'translateY(0)';
    
    // Force reflow before starting animation
    void slotRef.current.offsetHeight;
    
    // Calculate positions for smooth spinning
    const totalItems = damageValues.length * 3; // Triple for smooth loop
    const initialOffset = damageValues.length; // Start in middle section
    const rotations = 2; // Number of full rotations
    const totalDistance = totalItems * itemHeight.current;
    
    // Start spinning with cubic-bezier for arcade feel
    setTimeout(() => {
      if (!slotRef.current) return;
      
      slotRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.17, 0.67, 0.83, 0.67)`;
      slotRef.current.style.transform = `translateY(-${totalDistance}px)`;
      
      // Stop at the target value
      setTimeout(() => {
        if (!slotRef.current) return;
        
        const finalPosition = index * itemHeight.current;
        slotRef.current.style.transition = 'transform 500ms cubic-bezier(0.33, 1, 0.68, 1)';
        slotRef.current.style.transform = `translateY(-${finalPosition}px)`;
        
        setSpinning(false);
        setSelectedDamage(value);
        
        if (onComplete) {
          setTimeout(() => onComplete(value), 500);
        }
      }, duration);
    }, 50);
  };
  
  // Reset component when damage range changes
  useEffect(() => {
    if (slotRef.current) {
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = 'translateY(0)';
    }
    setSpinning(false);
    setSelectedDamage(null);
  }, [minDamage, maxDamage]);
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="overflow-hidden border-2 border-gray-400 rounded-lg bg-white shadow-inner h-14 w-36" 
        // style={{ height: `${itemHeight.current}px` }}
      >
        <div ref={slotRef} className="transition-transform">
          {/* Triple the values for smooth looping */}
          {[...damageValues, ...damageValues, ...damageValues].map((damage, index) => (
            <div 
              key={index} 
              className={`
                py-2 text-center text-3xl font-inter font-medium 
                ${selectedDamage === parseInt(damage) && !spinning 
                  ? "text-red-600 font-bold" 
                  : "text-gray-700"}
              `}
            >
              {damage}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={startSpin}
        disabled={spinning}
        className={`
          px-6 py-2 text-lg font-bold text-white rounded-lg w-36
          ${spinning 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
          }
        `}
      >
        {spinning ? 'Spinning...' : selectedDamage ? 'Spin Again' : 'Spin'}
      </button>
      
      {/* {selectedDamage && (
        <div className="text-xl font-bold">
          Attack Damage: {selectedDamage}
        </div>
      )} */}
    </div>
  );
}