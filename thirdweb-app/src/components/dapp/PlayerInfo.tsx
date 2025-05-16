import { Player } from "@/types/battle";

interface PlayerInfoProps {
  player: Player;
  isOpponent?: boolean;
  className?: string;
}

export default function PlayerInfo({ player, isOpponent = false, className = "" }: PlayerInfoProps) {
  return (
    <div className={`flex items-center ${isOpponent ? 'bg-slate-500 px-2 py-1 rounded-s-lg w-48 mb-1' : 'bg-slate-600 px-2 py-1 rounded-e-lg w-44'} ${className}`}>
      <span className="mr-2 truncate">{isOpponent ? 'Opponent' : 'You'}</span>
      <div className="flex ml-auto">
        {player.availableCards.map((i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full mx-0.5 flex items-center justify-center text-xs
              ${i === 0 ? "bg-green-500 border-2 border-white" : "bg-white"}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
} 