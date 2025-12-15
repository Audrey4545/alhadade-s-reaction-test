// Messages troll street pour Alhadade

export const getTrollMessage = (score: number, gameType: string): string => {
  // Pour les jeux de temps (plus bas = mieux) - seulement reflex maintenant
  if (gameType === 'reflex') {
    if (score < 200) {
      return getRandomMessage(excellentMessages);
    } else if (score < 300) {
      return getRandomMessage(goodMessages);
    } else if (score < 400) {
      return getRandomMessage(averageMessages);
    } else if (score < 600) {
      return getRandomMessage(badMessages);
    } else {
      return getRandomMessage(terribleMessages);
    }
  }
  
  // Pour les jeux de score (plus haut = mieux)
  if (score >= 90) {
    return getRandomMessage(excellentMessages);
  } else if (score >= 70) {
    return getRandomMessage(goodMessages);
  } else if (score >= 50) {
    return getRandomMessage(averageMessages);
  } else if (score >= 30) {
    return getRandomMessage(badMessages);
  } else {
    return getRandomMessage(terribleMessages);
  }
};

const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

const excellentMessages = [
  "Woah Alhadade, t'as des réflexes de dealer en cavale !",
  "Pas mal frère, t'as peut-être du potentiel finalement.",
  "OK j'avoue, là t'as assuré comme un vrai.",
  "Le flow ET les réflexes ? Respect Alhadade.",
  "T'as pris quoi avant de jouer ? Partage stp.",
];

const goodMessages = [
  "Correct Alhadade, mais t'emballe pas non plus.",
  "C'est acceptable. Pour un débutant.",
  "Tu commences à chauffer, continue comme ça.",
  "Pas dégueulasse, mais y'a de la marge.",
  "Le quartier serait presque fier de toi.",
];

const averageMessages = [
  "Le flow est là, les réflexes un peu moins.",
  "Mouais... T'as fait mieux j'espère ?",
  "C'est le WiFi qui lag ou c'est toi ?",
  "Alhadade au ralenti, épisode 47.",
  "T'es sûr que t'as pas 50 ans frère ?",
];

const badMessages = [
  "Même le skate roule plus vite que toi.",
  "T'as les réflexes d'un kebab froid.",
  "Damso mindset, escargot timing.",
  "Frérot, c'est gênant là.",
  "T'es sûr que t'as pas lag frère ?",
];

const terribleMessages = [
  "Alhadade, c'est confirmé : t'es un bot.",
  "Mon grand-père aveugle fait mieux.",
  "C'est pas des réflexes ça, c'est du yoga.",
  "T'as cliqué avec les pieds ou quoi ?",
  "Retourne dormir Alhadade, c'est mieux.",
  "Même le bitume réagit plus vite que toi.",
];

export const gameDescriptions: Record<string, string> = {
  reflex: "Teste tes réflexes bruts. Clique dès que tu vois le signal.",
  color: "ROUGE écrit en bleu ? Clique sur la COULEUR, pas le mot !",
  keyword: "Des mots défilent vite. Trouve ALHADADE, évite les pièges.",
  dontclick: "Parfois faut cliquer, parfois surtout pas. T'es assez malin ?",
  sequence: "6 couleurs, séquence longue, ça accélère. Bonne chance.",
};

export const gameNames: Record<string, string> = {
  reflex: "Reflex Timer",
  color: "Bonne Couleur",
  keyword: "Mot-Clé",
  dontclick: "Clique Pas",
  sequence: "Séquence Flash",
};

export const gameEmojis: Record<string, string> = {
  reflex: "⏱️",
  color: "🎨",
  keyword: "🧠",
  dontclick: "🚫",
  sequence: "🔢",
};
