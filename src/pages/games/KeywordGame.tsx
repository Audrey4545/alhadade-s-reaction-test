import { useState, useCallback, useEffect, useRef } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import GameButton from '@/components/GameButton';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'intro' | 'playing' | 'result';

const WORDS = ['FLOW', 'STREET', 'BITUME', 'SKATE', 'DAMSO', 'TRAP', 'HOOD', 'BOSS', 'CASH', 'DRIP'];
const TARGET_WORD = 'ALHADADE';
const ROUNDS = 10;
const WORD_DISPLAY_TIME = 800;

const KeywordGame = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentWord, setCurrentWord] = useState('');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isTargetWord, setIsTargetWord] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveScore } = useLocalScore();

  const showNextWord = useCallback(() => {
    if (round >= ROUNDS) {
      const finalScore = Math.round((score / ROUNDS) * 100);
      saveScore('keyword', finalScore);
      setGameState('result');
      return;
    }

    // 30% chance to show target word
    const showTarget = Math.random() < 0.3;
    const word = showTarget 
      ? TARGET_WORD 
      : WORDS[Math.floor(Math.random() * WORDS.length)];
    
    setCurrentWord(word);
    setIsTargetWord(showTarget);
    setFeedback(null);

    timeoutRef.current = setTimeout(() => {
      // Time's up for this word
      if (showTarget) {
        // Missed the target word
        setFeedback('wrong');
      }
      setRound(r => r + 1);
      setTimeout(() => showNextWord(), 300);
    }, WORD_DISPLAY_TIME);
  }, [round, score, saveScore]);

  const handleTap = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isTargetWord) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setRound(r => r + 1);
    setTimeout(() => showNextWord(), 400);
  }, [isTargetWord, showNextWord]);

  const startGame = () => {
    setGameState('playing');
    setRound(0);
    setScore(0);
    showNextWord();
  };

  const resetGame = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState('intro');
    setRound(0);
    setScore(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (gameState === 'result') {
    const finalScore = Math.round((score / ROUNDS) * 100);
    return (
      <GameResult
        gameType="keyword"
        score={finalScore}
        onRetry={resetGame}
      />
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <GameHeader gameType="keyword" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-fade-in max-w-sm">
            <p className="font-street text-3xl text-foreground mb-6">
              MOT-CLÉ
            </p>
            <p className="text-muted-foreground mb-4">
              Des mots vont défiler rapidement.
            </p>
            <p className="text-foreground mb-4">
              Appuie <span className="text-accent font-bold">UNIQUEMENT</span> quand tu vois :
            </p>
            <p className="font-street text-4xl text-primary text-glow mb-8">
              {TARGET_WORD}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Attention aux pièges ! {ROUNDS} mots au total.
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
      <GameHeader gameType="keyword" />
      
      {/* Progress */}
      <div className="p-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Mot {round + 1}/{ROUNDS}</span>
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
        className={cn(
          'flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-100',
          feedback === 'correct' && 'bg-success/20',
          feedback === 'wrong' && 'bg-street-red/20'
        )}
      >
        <p 
          className={cn(
            'font-street text-5xl md:text-6xl transition-all duration-100',
            isTargetWord ? 'text-primary text-glow' : 'text-foreground',
            feedback === 'correct' && 'text-success animate-bounce-in',
            feedback === 'wrong' && 'text-street-red animate-shake'
          )}
        >
          {feedback === 'correct' ? '✓' : feedback === 'wrong' ? '✗' : currentWord}
        </p>
        
        <p className="text-sm text-muted-foreground mt-8">
          Cherche : <span className="text-accent">{TARGET_WORD}</span>
        </p>
      </button>
    </div>
  );
};

export default KeywordGame;
