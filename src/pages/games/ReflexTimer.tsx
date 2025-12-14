import { useState, useCallback, useRef } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'waiting' | 'ready' | 'go' | 'clicked' | 'tooEarly' | 'result';

const ReflexTimer = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveScore } = useLocalScore();

  const startGame = useCallback(() => {
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
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState('tooEarly');
    } else if (gameState === 'go') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      saveScore('reflex', time);
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

  if (gameState === 'result') {
    return (
      <GameResult
        gameType="reflex"
        score={reactionTime}
        isTimeBased={true}
        onRetry={resetGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader gameType="reflex" />
      
      <button
        onClick={handleClick}
        className={cn(
          'flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-200',
          gameState === 'waiting' && 'bg-secondary',
          gameState === 'ready' && 'bg-street-red',
          gameState === 'go' && 'bg-success',
          gameState === 'tooEarly' && 'bg-street-red animate-shake'
        )}
      >
        {gameState === 'waiting' && (
          <div className="text-center animate-fade-in">
            <p className="font-street text-3xl text-foreground mb-4">
              PRÊT ?
            </p>
            <p className="text-muted-foreground">
              Appuie pour commencer
            </p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="text-center animate-fade-in">
            <p className="font-street text-4xl text-foreground mb-4">
              ATTENDS...
            </p>
            <p className="text-foreground/80">
              Ne clique pas encore !
            </p>
          </div>
        )}

        {gameState === 'go' && (
          <div className="text-center animate-bounce-in">
            <p className="font-street text-6xl text-foreground text-glow">
              GO !
            </p>
            <p className="text-foreground/80 mt-4">
              CLIQUE MAINTENANT !
            </p>
          </div>
        )}

        {gameState === 'tooEarly' && (
          <div className="text-center animate-fade-in">
            <p className="font-street text-3xl text-foreground mb-4">
              TROP TÔT !
            </p>
            <p className="text-foreground/80">
              T'es trop pressé Alhadade...
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

export default ReflexTimer;
