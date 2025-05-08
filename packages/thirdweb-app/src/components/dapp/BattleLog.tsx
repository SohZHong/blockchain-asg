interface BattleLogProps {
  logs: string[];
  className?: string;
}

export default function BattleLog({ logs, className = "" }: BattleLogProps) {
  if (logs.length === 0) return null;

  return (
    <div className={`bg-gray-100 p-3 rounded-lg w-full max-h-32 overflow-y-auto mb-4 text-sm ${className}`}>
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          {log}
        </div>
      ))}
    </div>
  );
} 