import { useNavigate } from 'react-router-dom';
import GameButton from '@/components/GameButton';
import { useLocalScore } from '@/hooks/useLocalScore';
import { gameNames, gameEmojis } from '@/lib/trollMessages';

const Index = () => {
  const navigate = useNavigate();
  const { getLastGame } = useLocalScore();
  const lastGame = getLastGame();

  const formatLastScore = () => {
    if (!lastGame.game || lastGame.score === null) return null;
    const isTimeBased = lastGame.game === 'reflex' || lastGame.game === 'color';
    return isTimeBased ? `${lastGame.score}ms` : `${lastGame.score}pts`;
  };

  return (
    <div className="min-h-screen bg-background gradient-street flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-fade-in">
          {/* Logo / Title */}
          <h1 className="font-street text-5xl md:text-7xl text-foreground mb-2 text-glow">
            RÉACTIVITÉ
          </h1>
          <h2 className="font-street text-3xl md:text-4xl text-primary mb-8">
            ALHADADE
          </h2>
          
          {/* Intro message */}
          <div className="max-w-sm mx-auto mb-10">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Bienvenue <span className="text-accent font-semibold">Alhadade</span>.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mt-2">
              On va voir si t'as vraiment des réflexes ou juste du flow.
            </p>
          </div>

          {/* Last score */}
          {lastGame.game && lastGame.score !== null && (
            <div className="mb-8 p-4 rounded-xl bg-card/50 border border-border animate-scale-in">
              <p className="text-sm text-muted-foreground mb-1">Dernier score</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">
                  {gameEmojis[lastGame.game as keyof typeof gameEmojis]}
                </span>
                <span className="font-street text-2xl text-accent">
                  {formatLastScore()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {gameNames[lastGame.game as keyof typeof gameNames]}
              </p>
            </div>
          )}

          {/* CTA Button */}
          <GameButton
            onClick={() => navigate('/games')}
            size="xl"
            className="animate-pulse-glow"
          >
            Lancer un défi
          </GameButton>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Fait pour troller Alhadade avec amour 💜
        </p>
      </footer>
    </div>
  );
};

export default Index;
