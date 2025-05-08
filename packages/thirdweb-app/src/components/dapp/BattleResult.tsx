interface BattleResultProps {
  result: 'win' | 'lose' | null;
  className?: string;
}

export default function BattleResult({ result, className = "" }: BattleResultProps) {
  if (!result) return null;

  return (
    <div
      className={`text-3xl font-bold my-4 ${
        result === "win" ? "text-green-600" : "text-red-600"
      } ${className}`}
    >
      {result === "win" ? "VICTORY!" : "DEFEAT!"}
    </div>
  );
} 