import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GameCard from '@/components/GameCard';
import { useLocalScore } from '@/hooks/useLocalScore';

const GameSelect = () => {
  const navigate = useNavigate();
  const { getBestScore } = useLocalScore();

  const games = ['reflex', 'color', 'keyword', 'dontclick', 'sequence'] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="font-street text-2xl text-foreground">
          Choisis ton défi
        </h1>
      </div>

      {/* Game List */}
      <div className="p-4 space-y-3">
        <p className="text-muted-foreground text-sm mb-4">
          Alhadade, montre-nous ce que t'as dans le ventre.
        </p>
        
        {games.map((game, index) => (
          <div 
            key={game}
            style={{ animationDelay: `${index * 0.1}s` }}
            className="animate-fade-in"
          >
            <GameCard 
              gameType={game} 
              bestScore={getBestScore(game)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSelect;
