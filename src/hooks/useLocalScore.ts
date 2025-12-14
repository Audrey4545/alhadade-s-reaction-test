import { useState, useEffect } from 'react';

interface GameScores {
  reflex: number | null;
  color: number | null;
  keyword: number | null;
  dontclick: number | null;
  sequence: number | null;
  lastPlayed: string | null;
  lastScore: number | null;
}

const STORAGE_KEY = 'alhadade-scores';

const defaultScores: GameScores = {
  reflex: null,
  color: null,
  keyword: null,
  dontclick: null,
  sequence: null,
  lastPlayed: null,
  lastScore: null,
};

export const useLocalScore = () => {
  const [scores, setScores] = useState<GameScores>(defaultScores);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setScores(JSON.parse(stored));
      } catch {
        setScores(defaultScores);
      }
    }
  }, []);

  const saveScore = (gameType: keyof Omit<GameScores, 'lastPlayed' | 'lastScore'>, score: number) => {
    const newScores = {
      ...scores,
      [gameType]: scores[gameType] === null 
        ? score 
        : (gameType === 'reflex' || gameType === 'color' 
            ? Math.min(scores[gameType]!, score) 
            : Math.max(scores[gameType]!, score)),
      lastPlayed: gameType,
      lastScore: score,
    };
    setScores(newScores);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScores));
  };

  const getBestScore = (gameType: keyof Omit<GameScores, 'lastPlayed' | 'lastScore'>) => {
    return scores[gameType];
  };

  const getLastGame = () => {
    return {
      game: scores.lastPlayed,
      score: scores.lastScore,
    };
  };

  return { scores, saveScore, getBestScore, getLastGame };
};
