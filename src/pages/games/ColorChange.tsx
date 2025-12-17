import { useState, useCallback, useRef } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import GameButton from '@/components/GameButton';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'intro' | 'playing' | 'feedback' | 'result';

const COLORS = [
  { id: 0, name: 'VIOLET', textClass: 'text-primary' },
  { id: 1, name: 'VERT', textClass: 'text-success' },
  { id: 2, name: 'ROUGE', textClass: 'text-street-red' },
  { id: 3, name: 'BLEU', textClass: 'text-blue-500' },
];

const ROUNDS = 15;
const TIME_PER_ROUND = 2500; // 2.5 seconds to respond

const ColorChange = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [displayedWord, setDisplayedWord] = useState(COLORS[0]);
  const [displayColor, setDisplayColor] = useState(COLORS[0]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const roundRef = useRef(0);
  const scoreRef = useRef(0);
  const { saveScore } = useLocalScore();

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const showNextRound = useCallback(() => {
    if (roundRef.current >= ROUNDS) {
      const finalScore = Math.round((scoreRef.current / ROUNDS) * 100);
      saveScore('color', finalScore);
      setGameState('result');
      return;
    }

    // Pick random word and random display color (different from word meaning)
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    let colorIndex = Math.floor(Math.random() * COLORS.length);
    // 70% chance color is different from word
    if (Math.random() < 0.7) {
      while (colorIndex === wordIndex) {
        colorIndex = Math.floor(Math.random() * COLORS.length);
      }
    }

    setDisplayedWord(COLORS[wordIndex]);
    setDisplayColor(COLORS[colorIndex]);
    setFeedback(null);
    setTimeLeft(TIME_PER_ROUND);
    setRound(roundRef.current);
    setGameState('playing');

    // Timer countdown
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimeLeft(Math.max(0, TIME_PER_ROUND - elapsed));
    }, 50);

    // Timeout - no response
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setFeedback('wrong');
      setGameState('feedback');
      setTimeout(() => {
        roundRef.current += 1;
        showNextRound();
      }, 600);
    }, TIME_PER_ROUND);
  }, [saveScore, clearTimers]);

  const handleColorClick = useCallback((colorId: number) => {
    if (gameState !== 'playing') return;

    clearTimers();

    // Player must click the COLOR displayed, not the word meaning
    if (colorId === displayColor.id) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setGameState('feedback');
    setTimeout(() => {
      roundRef.current += 1;
      showNextRound();
    }, 600);
  }, [gameState, displayColor, clearTimers, showNextRound]);

  const startGame = useCallback(() => {
    roundRef.current = 0;
    scoreRef.current = 0;
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
        gameType="color"
        score={finalScore}
        onRetry={resetGame}
      />
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <GameHeader gameType="color" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-fade-in max-w-sm">
            <p className="font-street text-3xl text-foreground mb-6">
              BONNE COULEUR
            </p>
            <p className="text-muted-foreground mb-4">
              Un mot de couleur va s'afficher.
            </p>
            <div className="mb-6 p-4 bg-card rounded-xl border border-border">
              <p className="text-foreground mb-2">Exemple :</p>
              <p className="font-street text-4xl text-blue-500 mb-2">ROUGE</p>
              <p className="text-sm text-muted-foreground">
                Le mot dit "ROUGE" mais il est écrit en <span className="text-blue-500 font-bold">BLEU</span>
              </p>
            </div>
            <p className="text-accent font-bold mb-4">
              Appuie sur la COULEUR d'affichage !
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              {ROUNDS} rounds. Pas le droit à l'erreur Alhadade.
            </p>
            <GameButton onClick={startGame} size="lg">
              C'est parti !
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader gameType="color" />
      
      {/* Progress */}
      <div className="p-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Round {round + 1}/{ROUNDS}</span>
          <span className="text-accent">Score: {score}</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${(timeLeft / TIME_PER_ROUND) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Word display */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {(gameState === 'playing' || gameState === 'feedback') && (
          <div className="text-center mb-8">
            {feedback ? (
              <p className={cn(
                'font-street text-6xl',
                feedback === 'correct' ? 'text-success animate-bounce-in' : 'text-street-red animate-shake'
              )}>
                {feedback === 'correct' ? '✓' : '✗'}
              </p>
            ) : (
              <p className={cn('font-street text-6xl md:text-7xl animate-bounce-in', displayColor.textClass)}>
                {displayedWord.name}
              </p>
            )}
          </div>
        )}

        {/* Color buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              disabled={gameState !== 'playing'}
              className={cn(
                'h-20 rounded-xl transition-all duration-150 active:scale-95 font-street text-lg border-2 border-border bg-card text-foreground',
                gameState === 'playing' ? 'cursor-pointer hover:bg-muted' : 'opacity-50 cursor-default'
              )}
            >
              {color.name}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Appuie sur la <span className="text-accent font-bold">COULEUR</span> du texte !
        </p>
      </div>
    </div>
  );
};

export default ColorChange;
