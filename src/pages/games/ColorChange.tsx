import { useState, useCallback, useRef, useEffect } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'waiting' | 'ready' | 'go' | 'tooEarly' | 'result';

const COLORS = [
  { name: 'violet', class: 'bg-primary' },
  { name: 'vert', class: 'bg-success' },
  { name: 'rouge', class: 'bg-street-red' },
  { name: 'bleu', class: 'bg-blue-600' },
];

const ColorChange = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveScore } = useLocalScore();

  const startGame = useCallback(() => {
    // Pick random target color
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(color);
    setGameState('ready');
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('go');
      startTimeRef.current = Date.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      startGame();
    } else if (gameState === 'ready') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState('tooEarly');
    } else if (gameState === 'go') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      saveScore('color', time);
      setGameState('result');
    } else if (gameState === 'tooEarly') {
      setGameState('waiting');
    }
  }, [gameState, startGame, saveScore]);

  const resetGame = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState('waiting');
    setReactionTime(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (gameState === 'result') {
    return (
      <GameResult
        gameType="color"
        score={reactionTime}
        isTimeBased={true}
        onRetry={resetGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader gameType="color" />
      
      <button
        onClick={handleClick}
        className={cn(
          'flex-1 flex flex-col items-center justify-center p-6 transition-all duration-100',
          gameState === 'waiting' && 'bg-secondary',
          gameState === 'ready' && 'bg-muted',
          gameState === 'go' && targetColor.class,
          gameState === 'tooEarly' && 'bg-street-red animate-shake'
        )}
      >
        {gameState === 'waiting' && (
          <div className="text-center animate-fade-in">
            <p className="font-street text-3xl text-foreground mb-4">
              FLASH COULEUR
            </p>
            <p className="text-muted-foreground">
              L'écran va changer de couleur.
            </p>
            <p className="text-muted-foreground mt-2">
              Appuie dès que ça change !
            </p>
            <p className="text-sm text-accent mt-6">
              Appuie pour commencer
            </p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="text-center animate-fade-in">
            <p className="font-street text-4xl text-foreground mb-4">
              FIXE L'ÉCRAN...
            </p>
            <p className="text-muted-foreground">
              La couleur va changer
            </p>
          </div>
        )}

        {gameState === 'go' && (
          <div className="text-center animate-bounce-in">
            <p className="font-street text-6xl text-foreground text-glow drop-shadow-lg">
              MAINTENANT !
            </p>
          </div>
        )}

        {gameState === 'tooEarly' && (
          <div className="text-center animate-fade-in">
            <p className="font-street text-3xl text-foreground mb-4">
              TROP TÔT !
            </p>
            <p className="text-foreground/80">
              Patience Alhadade...
            </p>
            <p className="text-sm text-foreground/60 mt-4">
              Appuie pour réessayer
            </p>
          </div>
        )}
      </button>
    </div>
  );
};

export default ColorChange;
