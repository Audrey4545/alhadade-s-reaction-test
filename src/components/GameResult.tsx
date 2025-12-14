import { getTrollMessage, gameNames, gameEmojis } from '@/lib/trollMessages';
import GameButton from './GameButton';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GameResultProps {
  gameType: 'reflex' | 'color' | 'keyword' | 'dontclick' | 'sequence';
  score: number;
  isTimeBased?: boolean;
  onRetry: () => void;
}

const GameResult = ({ gameType, score, isTimeBased = false, onRetry }: GameResultProps) => {
  const navigate = useNavigate();
  const trollMessage = getTrollMessage(score, gameType);

  const formatScore = () => {
    if (isTimeBased) {
      return `${score}ms`;
    }
    return `${score} points`;
  };

  const getScoreColor = () => {
    if (isTimeBased) {
      if (score < 250) return 'text-success';
      if (score < 400) return 'text-accent';
      return 'text-street-red';
    }
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-accent';
    return 'text-street-red';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-4 block animate-bounce-in">
          {gameEmojis[gameType]}
        </span>
        
        <h2 className="font-street text-2xl text-muted-foreground mb-2">
          {gameNames[gameType]}
        </h2>
        
        <div className={cn('font-street text-6xl mb-6 text-glow', getScoreColor())}>
          {formatScore()}
        </div>
        
        <p className="text-lg text-foreground mb-8 italic leading-relaxed">
          "{trollMessage}"
        </p>
        
        <div className="flex flex-col gap-3">
          <GameButton onClick={onRetry} size="lg" className="w-full">
            Réessayer
          </GameButton>
          
          <GameButton 
            onClick={() => navigate('/games')} 
            variant="secondary" 
            size="md"
            className="w-full"
          >
            Autres jeux
          </GameButton>
          
          <GameButton 
            onClick={() => navigate('/')} 
            variant="secondary" 
            size="sm"
            glow={false}
            className="w-full"
          >
            Accueil
          </GameButton>
        </div>
      </div>
    </div>
  );
};

export default GameResult;
