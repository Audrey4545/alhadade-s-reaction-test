import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { gameDescriptions, gameNames, gameEmojis } from '@/lib/trollMessages';

interface GameCardProps {
  gameType: 'reflex' | 'color' | 'keyword' | 'dontclick' | 'sequence';
  bestScore?: number | null;
}

const GameCard = ({ gameType, bestScore }: GameCardProps) => {
  const navigate = useNavigate();

  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '--';
    if (gameType === 'reflex' || gameType === 'color') {
      return `${score}ms`;
    }
    return `${score}pts`;
  };

  return (
    <button
      onClick={() => navigate(`/game/${gameType}`)}
      className={cn(
        'w-full p-5 rounded-xl border-2 border-border bg-card/50',
        'transition-all duration-300 hover:border-primary hover:bg-card',
        'hover:box-glow active:scale-98 text-left',
        'animate-fade-in'
      )}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{gameEmojis[gameType]}</span>
        <div className="flex-1">
          <h3 className="font-street text-xl text-foreground mb-1">
            {gameNames[gameType]}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {gameDescriptions[gameType]}
          </p>
          {bestScore !== null && bestScore !== undefined && (
            <p className="text-xs text-accent mt-2 font-medium">
              Meilleur : {formatScore(bestScore)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default GameCard;
