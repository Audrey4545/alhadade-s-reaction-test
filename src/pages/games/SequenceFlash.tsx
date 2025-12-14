import { useState, useCallback, useEffect, useRef } from 'react';
import GameHeader from '@/components/GameHeader';
import GameResult from '@/components/GameResult';
import GameButton from '@/components/GameButton';
import { useLocalScore } from '@/hooks/useLocalScore';
import { cn } from '@/lib/utils';

type GameState = 'intro' | 'showing' | 'input' | 'feedback' | 'result';

const COLORS = [
  { id: 0, name: 'violet', activeClass: 'bg-primary box-glow', inactiveClass: 'bg-primary/30' },
  { id: 1, name: 'vert', activeClass: 'bg-success box-glow-success', inactiveClass: 'bg-success/30' },
  { id: 2, name: 'rouge', activeClass: 'bg-street-red box-glow-danger', inactiveClass: 'bg-street-red/30' },
  { id: 3, name: 'bleu', activeClass: 'bg-blue-500', inactiveClass: 'bg-blue-500/30' },
];

const FLASH_DURATION = 500;
const PAUSE_DURATION = 200;

const SequenceFlash = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { saveScore } = useLocalScore();

  const generateSequence = useCallback((length: number) => {
    const newSequence: number[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    return newSequence;
  }, []);

  const playSequence = useCallback(async (seq: number[]) => {
    setGameState('showing');
    setActiveColor(null);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, PAUSE_DURATION));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, FLASH_DURATION));
      setActiveColor(null);
    }
    
    await new Promise(resolve => setTimeout(resolve, PAUSE_DURATION));
    setGameState('input');
    setUserInput([]);
  }, []);

  const startGame = useCallback(() => {
    const newSequence = generateSequence(3);
    setSequence(newSequence);
    setLevel(1);
    setIsCorrect(null);
    playSequence(newSequence);
  }, [generateSequence, playSequence]);

  const handleColorClick = useCallback((colorId: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, colorId];
    setUserInput(newInput);
    setActiveColor(colorId);
    
    setTimeout(() => setActiveColor(null), 150);

    // Check if wrong
    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      setIsCorrect(false);
      setGameState('feedback');
      const finalScore = Math.max(0, (level - 1) * 20);
      saveScore('sequence', finalScore);
      setTimeout(() => setGameState('result'), 1000);
      return;
    }

    // Check if complete
    if (newInput.length === sequence.length) {
      setIsCorrect(true);
      setGameState('feedback');
      
      setTimeout(() => {
        // Next level - add one more to sequence
        const nextSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSequence);
        setLevel(l => l + 1);
        setIsCorrect(null);
        playSequence(nextSequence);
      }, 1000);
    }
  }, [gameState, userInput, sequence, level, playSequence, saveScore]);

  const resetGame = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState('intro');
    setSequence([]);
    setUserInput([]);
    setLevel(1);
    setIsCorrect(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (gameState === 'result') {
    const finalScore = Math.max(0, (level - 1) * 20);
    return (
      <GameResult
        gameType="sequence"
        score={finalScore}
        onRetry={resetGame}
      />
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <GameHeader gameType="sequence" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-fade-in max-w-sm">
            <p className="font-street text-3xl text-foreground mb-6">
              SÉQUENCE FLASH
            </p>
            <p className="text-muted-foreground mb-4">
              Observe la séquence de couleurs.
            </p>
            <p className="text-foreground mb-4">
              Puis reproduis-la dans le même ordre.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Ça commence facile... puis ça accélère. 
              <br />Combien de niveaux tu tiens, Alhadade ?
            </p>
            <GameButton onClick={startGame} size="lg">
              Let's go
            </GameButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader gameType="sequence" />
      
      {/* Level indicator */}
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-sm">
          Niveau <span className="text-accent font-bold">{level}</span>
          {' • '}
          Séquence de <span className="text-accent font-bold">{sequence.length}</span>
        </p>
        {gameState === 'showing' && (
          <p className="text-primary font-street text-lg mt-2 animate-pulse">
            OBSERVE...
          </p>
        )}
        {gameState === 'input' && (
          <p className="text-success font-street text-lg mt-2">
            À TOI ! ({userInput.length}/{sequence.length})
          </p>
        )}
        {gameState === 'feedback' && isCorrect && (
          <p className="text-success font-street text-lg mt-2 animate-bounce-in">
            BIEN JOUÉ !
          </p>
        )}
        {gameState === 'feedback' && isCorrect === false && (
          <p className="text-street-red font-street text-lg mt-2 animate-shake">
            RATÉ !
          </p>
        )}
      </div>
      
      {/* Color grid */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs aspect-square">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              disabled={gameState !== 'input'}
              className={cn(
                'rounded-xl transition-all duration-150 active:scale-95',
                activeColor === color.id ? color.activeClass : color.inactiveClass,
                gameState === 'input' && 'cursor-pointer hover:opacity-80',
                gameState !== 'input' && 'cursor-default'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SequenceFlash;
