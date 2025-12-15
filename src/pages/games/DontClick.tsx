import { useState, useCallback, useRef } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import GameButton from '@/components/GameButton';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'intro' | 'playing' | 'feedback' | 'result';
type Instruction = 'click' | 'dontclick';

const ROUNDS = 12;
const DISPLAY_TIME = 1200; // Faster

const DontClick = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [instruction, setInstruction] = useState<Instruction>('click');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveScore } = useLocalScore();

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
  }, []);

  const showNextRound = useCallback(() => {
    if (round >= ROUNDS) {
      const finalScore = Math.round((score / ROUNDS) * 100);
      saveScore('dontclick', finalScore);
      setGameState('result');
      return;
    }

    // Random instruction
    const shouldClick = Math.random() < 0.5;
    setInstruction(shouldClick ? 'click' : 'dontclick');
    setHasClicked(false);
    setFeedback(null);
    setGameState('playing');

    timeoutRef.current = setTimeout(() => {
      // Time's up - evaluate based on current instruction
      if (!hasClicked) {
        if (shouldClick) {
          // Should have clicked but didn't
          setFeedback('wrong');
        } else {
          // Correctly didn't click
          setScore(s => s + 1);
          setFeedback('correct');
        }
      }
      setGameState('feedback');
      nextRoundTimeoutRef.current = setTimeout(() => {
        setRound(r => r + 1);
        showNextRound();
      }, 500);
    }, DISPLAY_TIME);
  }, [round, score, hasClicked, saveScore]);

  const handleTap = useCallback(() => {
    if (gameState !== 'playing' || hasClicked) return;
    
    setHasClicked(true);
    clearTimers();

    if (instruction === 'click') {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setGameState('feedback');
    nextRoundTimeoutRef.current = setTimeout(() => {
      setRound(r => r + 1);
      showNextRound();
    }, 500);
  }, [gameState, hasClicked, instruction, clearTimers, showNextRound]);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setFeedback(null);
    showNextRound();
  }, [showNextRound]);

  const resetGame = useCallback(() => {
    clearTimers();
    setGameState('intro');
    setRound(0);
    setScore(0);
    setFeedback(null);
  }, [clearTimers]);

  if (gameState === 'result') {
    const finalScore = Math.round((score / ROUNDS) * 100);
    return (
      <GameResult
        gameType="dontclick"
        score={finalScore}
        onRetry={resetGame}
      />
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <GameHeader gameType="dontclick" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-fade-in max-w-sm">
            <p className="font-street text-3xl text-foreground mb-6">
              CLIQUE PAS
            </p>
            <p className="text-muted-foreground mb-4">
              Les instructions vont alterner rapidement.
            </p>
            <div className="space-y-3 mb-8">
              <p className="text-success font-bold">
                "CLIQUE" → Tu cliques
              </p>
              <p className="text-street-red font-bold">
                "CLIQUE PAS" → Tu résistes
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              {ROUNDS} rounds. Ça va vite. Contrôle tes réflexes, Alhadade.
            </p>
            <GameButton onClick={startGame} size="lg">
              Je suis prêt
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader gameType="dontclick" />
      
      {/* Progress */}
      <div className="p-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Round {round + 1}/{ROUNDS}</span>
          <span className="text-accent">Score: {score}</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((round + 1) / ROUNDS) * 100}%` }}
          />
        </div>
      </div>
      
      <button
        onClick={handleTap}
        disabled={gameState !== 'playing'}
        className={cn(
          'flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-100',
          gameState === 'playing' && instruction === 'click' && 'bg-success/10',
          gameState === 'playing' && instruction === 'dontclick' && 'bg-street-red/10',
          feedback === 'correct' && 'bg-success/20',
          feedback === 'wrong' && 'bg-street-red/20'
        )}
      >
        {gameState === 'feedback' ? (
          <p 
            className={cn(
              'font-street text-6xl',
              feedback === 'correct' ? 'text-success animate-bounce-in' : 'text-street-red animate-shake'
            )}
          >
            {feedback === 'correct' ? '✓' : '✗'}
          </p>
        ) : (
          <p 
            className={cn(
              'font-street text-5xl md:text-7xl animate-bounce-in',
              instruction === 'click' ? 'text-success' : 'text-street-red'
            )}
          >
            {instruction === 'click' ? 'CLIQUE !' : 'CLIQUE PAS !'}
          </p>
        )}
      </button>
    </div>
  );
};

export default DontClick;
