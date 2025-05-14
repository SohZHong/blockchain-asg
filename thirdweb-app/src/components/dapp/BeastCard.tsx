import Image from "next/image";
import { BeastCard as BeastCardType } from "@/types/battle";

interface BeastCardProps {
  beast: BeastCardType;
  isAttacking?: boolean;
  isShaking?: boolean;
  className?: string;
}

export default function BeastCard({ beast, isAttacking = false, isShaking = false, className = "" }: BeastCardProps) {
  return (
    <div className={`relative w-[220px] h-[220px] ${isAttacking ? 'animate-attack' : ''} ${isShaking ? 'animate-shake' : ''} ${className}`}>
      <Image
        src={beast.image}
        alt={beast.name}
        width={220}
        height={300}
        className={`rounded-lg border-4 ${
          beast.type === "Common"
            ? "border-gray-400"
            : beast.type === "Rare"
            ? "border-blue-400"
            : beast.type === "Epic"
            ? "border-purple-400"
            : "border-yellow-400"
        }`}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg">
        <div className="text-center font-dark-mystic text-xl">
          {beast.name}
        </div>
        <div className="flex justify-between text-sm px-2">
          <div>
            DODGE
            <br />
            {beast.dodge}
          </div>
          <div>
            HEALTH
            <br />
            {beast.health}
          </div>
          <div>
            ATTACK
            <br />
            {beast.attack}
          </div>
        </div>
      </div>
      <div
        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500 h-2 rounded-full transition-all duration-300"
        style={{
          width: `${(beast.health / beast.maxHealth) * 100}%`,
          maxWidth: "90%",
        }}
      ></div>
    </div>
  );
} 