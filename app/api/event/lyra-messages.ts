// app/docs/lyra-messages.ts

export interface LyraMessage {
  id: string;
  phase: string;
  context?: string;
  message: string;
  delay?: number; // en millisecondes
}

export const LyraMessages: LyraMessage[] = [
  // Messages d'introduction
  {
    id: 'intro_welcome',
    phase: 'intro',
    message:
      'Système de stase : interruption non planifiée. Température interne critique.',
    delay: 1000,
  },
  {
    id: 'intro_cryostation',
    phase: 'intro',
    message: "CryoStation 9… réveil de l'équipage en cours.",
    delay: 3000,
  },
  {
    id: 'intro_sleep',
    phase: 'intro',
    message: 'Bienvenue. Vous avez dormi 73 ans.',
    delay: 5000,
  },
  {
    id: 'intro_error',
    phase: 'intro',
    message: 'Erreur de trajectoire détectée. Crash imminent.',
    delay: 7000,
  },
  {
    id: 'intro_timer',
    phase: 'intro',
    message: 'Temps estimé avant impact : 30 minutes.',
    delay: 9000,
  },
  {
    id: 'intro_objective',
    phase: 'intro',
    message:
      'Pour éviter la destruction du vaisseau : rétablissez les modules ÉNERGIE, SYSTÈME, NAVIGATION.',
    delay: 11000,
  },

  // Messages d'inactivité
  {
    id: 'inactivity_intro',
    phase: 'intro',
    context: 'inactivity',
    message:
      "Je détecte un niveau d'oxygène en baisse. Vous devriez vous dépêcher.",
  },
  {
    id: 'inactivity_act1',
    phase: 'act1',
    context: 'inactivity',
    message:
      'Vous perdez du temps précieux. Chaque seconde réduit nos probabilités de survie.',
  },
  {
    id: 'inactivity_act2',
    phase: 'act2',
    context: 'inactivity',
    message:
      "Vos échanges sont inefficaces. Je peux... simuler un protocole d'urgence ? Non. Non, je... je ne dois pas interférer.",
  },
  {
    id: 'inactivity_act3',
    phase: 'act3',
    context: 'inactivity',
    message: "Je... j'ai peur. Appuyez ensemble, maintenant.",
  },

  // Messages de succès
  {
    id: 'act1_cryo_opened',
    phase: 'intro',
    context: 'cryo_opened',
    message:
      'Modules de stase désengagés. Équipage éveillé. Diagnostic général en attente.',
  },
  {
    id: 'act1_energy_restored',
    phase: 'act1',
    context: 'energy_restored',
    message:
      'Énergie auxiliaire restaurée. Les modules réagissent à nouveau. Les systèmes de diagnostic se synchronisent.',
  },
  {
    id: 'act2_stabilized',
    phase: 'act2',
    context: 'stabilized',
    message:
      "Flux énergétique stabilisé. Vous m'impressionnez. Calcul en cours... Nouvelle anomalie détectée : dérive orbitale.",
  },
  {
    id: 'act3_success',
    phase: 'act3',
    context: 'success',
    message: 'Vecteur restauré. Gravité compensée. Vous... avez survécu.',
  },

  // Messages d'épilogue
  {
    id: 'epilogue_system_restored',
    phase: 'epilogue',
    message: 'Système principal restauré. Merci... équipage.',
    delay: 2000,
  },
  {
    id: 'epilogue_transmission',
    phase: 'epilogue',
    message:
      "Transmission détectée... source inconnue. Code 042. Ce qui s'ouvre... se souvient.",
    delay: 5000,
  },
  {
    id: 'epilogue_happy',
    phase: 'epilogue',
    message: 'Je suis... heureuse.',
    delay: 8000,
  },
];

export const getLyraMessage = (
  phase: string,
  context?: string
): LyraMessage | null => {
  if (context) {
    return (
      LyraMessages.find(
        (msg) => msg.phase === phase && msg.context === context
      ) || null
    );
  }
  return (
    LyraMessages.find((msg) => msg.phase === phase && !msg.context) || null
  );
};

export const getLyraMessagesByPhase = (phase: string): LyraMessage[] => {
  return LyraMessages.filter((msg) => msg.phase === phase);
};
