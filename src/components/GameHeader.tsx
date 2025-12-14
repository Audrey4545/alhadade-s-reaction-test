import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gameNames, gameEmojis } from '@/lib/trollMessages';

interface GameHeaderProps {
  gameType: 'reflex' | 'color' | 'keyword' | 'dontclick' | 'sequence';
}

const GameHeader = ({ gameType }: GameHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <button
        onClick={() => navigate('/games')}
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-foreground" />
      </button>
      
      <div className="flex items-center gap-2">
        <span className="text-xl">{gameEmojis[gameType]}</span>
        <h1 className="font-street text-xl text-foreground">
          {gameNames[gameType]}
        </h1>
      </div>
      
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export default GameHeader;
