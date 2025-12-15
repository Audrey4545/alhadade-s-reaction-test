import { useState, useCallback, useRef } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import GameButton from '@/components/GameButton';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'intro' | 'playing' | 'feedback' | 'result';

const TRAP_WORDS = ['ALHADAD', 'ALHADABE', 'ALHADADA', 'ALHADADÉ', 'ALHADABE', 'ALADADE', 'ALHADAD3'];
const DISTRACTION_WORDS = ['FLOW', 'STREET', 'BITUME', 'SKATE', 'DAMSO', 'TRAP', 'HOOD', 'BOSS', 'CASH', 'DRIP', 'VIDA LOCA', 'IPSÉITÉ', 'FARINIGHT'];
const TARGET_WORD = 'ALHADADE';
const ROUNDS = 15;
const WORD_DISPLAY_TIME = 600; // Faster - harder

const KeywordGame = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentWord, setCurrentWord] = useState('');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isTargetWord, setIsTargetWord] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hasClicked, setHasClicked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveScore } = useLocalScore();

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (nextWordTimeoutRef.current) {
      clearTimeout(nextWordTimeoutRef.current);
      nextWordTimeoutRef.current = null;
    }
  }, []);

  const showNextWord = useCallback(() => {
    if (round >= ROUNDS) {
      const finalScore = Math.round((score / ROUNDS) * 100);
      saveScore('keyword', finalScore);
      setGameState('result');
      return;
    }

    // 25% target, 25% trap, 50% distraction
    const rand = Math.random();
    let word: string;
    let isTarget: boolean;
    
    if (rand < 0.25) {
      word = TARGET_WORD;
      isTarget = true;
    } else if (rand < 0.5) {
      word = TRAP_WORDS[Math.floor(Math.random() * TRAP_WORDS.length)];
      isTarget = false;
    } else {
      word = DISTRACTION_WORDS[Math.floor(Math.random() * DISTRACTION_WORDS.length)];
      isTarget = false;
    }
    
    setCurrentWord(word);
    setIsTargetWord(isTarget);
    setFeedback(null);
    setHasClicked(false);
    setGameState('playing');

    // Time's up - word disappears
    timeoutRef.current = setTimeout(() => {
      if (isTarget) {
        // Missed target word
        setFeedback('wrong');
        setGameState('feedback');
      }
      // Move to next round
      nextWordTimeoutRef.current = setTimeout(() => {
        setRound(r => r + 1);
        showNextWord();
      }, isTarget ? 500 : 100);
    }, WORD_DISPLAY_TIME);
  }, [round, score, saveScore]);

  const handleTap = useCallback(() => {
    if (gameState !== 'playing' || hasClicked) return;
    
    setHasClicked(true);
    clearTimers();

    if (isTargetWord) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setGameState('feedback');
    nextWordTimeoutRef.current = setTimeout(() => {
      setRound(r => r + 1);
      showNextWord();
    }, 500);
  }, [gameState, hasClicked, isTargetWord, clearTimers, showNextWord]);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setFeedback(null);
    showNextWord();
  }, [showNextWord]);

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
              Des mots vont défiler très rapidement.
            </p>
            <p className="text-foreground mb-4">
              Appuie <span className="text-accent font-bold">UNIQUEMENT</span> quand tu vois :
            </p>
            <p className="font-street text-4xl text-primary text-glow mb-4">
              {TARGET_WORD}
            </p>
            <div className="text-sm text-street-red mb-8 p-3 bg-street-red/10 rounded-lg">
              <p className="font-bold mb-1">⚠️ PIÈGES !</p>
              <p>Des mots ressemblent beaucoup... ALHADAD, ALHADABE...</p>
              <p className="mt-1">Ne te fais pas avoir !</p>
            </div>
            <p className="text-xs text-muted-foreground mb-8">
              {ROUNDS} mots au total.
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
        disabled={gameState !== 'playing'}
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
