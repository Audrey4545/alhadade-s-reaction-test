import { useState, useCallback, useRef } from 'react';
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
  { id: 4, name: 'jaune', activeClass: 'bg-yellow-500', inactiveClass: 'bg-yellow-500/30' },
  { id: 5, name: 'cyan', activeClass: 'bg-cyan-500', inactiveClass: 'bg-cyan-500/30' },
];

const getFlashDuration = (level: number) => Math.max(200, 400 - level * 30);
const getPauseDuration = (level: number) => Math.max(100, 200 - level * 20);
const getStartingLength = () => 4; // Start with 4 colors instead of 3

const SequenceFlash = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const isCancelledRef = useRef(false);
  const { saveScore } = useLocalScore();

  const generateSequence = useCallback((length: number) => {
    const newSequence: number[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * COLORS.length));
    }
    return newSequence;
  }, []);

  const playSequence = useCallback(async (seq: number[], currentLevel: number) => {
    setGameState('showing');
    setActiveColor(null);
    isCancelledRef.current = false;

    const flashDuration = getFlashDuration(currentLevel);
    const pauseDuration = getPauseDuration(currentLevel);
    
    for (let i = 0; i < seq.length; i++) {
      if (isCancelledRef.current) return;
      await new Promise(resolve => setTimeout(resolve, pauseDuration));
      if (isCancelledRef.current) return;
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, flashDuration));
      if (isCancelledRef.current) return;
      setActiveColor(null);
    }
    
    if (isCancelledRef.current) return;
    await new Promise(resolve => setTimeout(resolve, pauseDuration));
    if (isCancelledRef.current) return;
    setGameState('input');
    setUserInput([]);
  }, []);

  const startGame = useCallback(() => {
    const startLength = getStartingLength();
    const newSequence = generateSequence(startLength);
    setSequence(newSequence);
    setLevel(1);
    setIsCorrect(null);
    playSequence(newSequence, 1);
  }, [generateSequence, playSequence]);

  const handleColorClick = useCallback((colorId: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, colorId];
    setUserInput(newInput);
    setActiveColor(colorId);
    
    setTimeout(() => setActiveColor(null), 100);

    // Check if wrong
    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      setIsCorrect(false);
      setGameState('feedback');
      const finalScore = Math.max(0, (level - 1) * 15 + (sequence.length - getStartingLength()) * 5);
      saveScore('sequence', finalScore);
      setTimeout(() => setGameState('result'), 1000);
      return;
    }

    // Check if complete
    if (newInput.length === sequence.length) {
      setIsCorrect(true);
      setGameState('feedback');
      
      setTimeout(() => {
        // Next level - generate a completely NEW sequence with one more color
        const nextLength = sequence.length + 1;
        const nextSequence = generateSequence(nextLength);
        setSequence(nextSequence);
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setIsCorrect(null);
        playSequence(nextSequence, nextLevel);
      }, 800);
    }
  }, [gameState, userInput, sequence, level, playSequence, saveScore]);

  const resetGame = useCallback(() => {
    isCancelledRef.current = true;
    setGameState('intro');
    setSequence([]);
    setUserInput([]);
    setLevel(1);
    setIsCorrect(null);
  }, []);

  if (gameState === 'result') {
    const finalScore = Math.max(0, (level - 1) * 15 + (sequence.length - getStartingLength()) * 5);
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
            <div className="text-sm text-street-red mb-8 p-3 bg-street-red/10 rounded-lg">
              <p className="font-bold mb-1">⚡ MODE HARDCORE</p>
              <p>6 couleurs • Démarre à 4 • Accélère vite</p>
              <p className="mt-1">T'as la mémoire, Alhadade ?</p>
            </div>
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
      
      {/* Color grid - 6 colors in 2x3 */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              disabled={gameState !== 'input'}
              className={cn(
                'aspect-square rounded-xl transition-all duration-100 active:scale-95',
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
