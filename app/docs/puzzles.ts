// app/docs/puzzles.ts

import { Room } from '@/utils/room';

// --- Types de Base ---

export interface Effect {
  type:
    | 'SET_MODULE_STATUS'
    | 'ADVANCE_PHASE'
    | 'SET_GAUGE'
    | 'EMIT_LYRA_MESSAGE'
    | 'UNLOCK_PUZZLE'
    | 'OPEN_SYNC_WINDOW'
    | 'SET_PUZZLE_STATE';
  payload: any;
}

export interface Hint {
  level1: string;
  level2: string;
  level3: string;
}

// Interface pour un puzzle individuel dans la base de données
export interface PuzzleState {
  id: string;
  type: string;
  state: 'locked' | 'solving' | 'solved';
  data: Record<string, any>; // Données spécifiques au puzzle (ex: code saisi, nœuds connectés)
}

// Interface pour la définition complète d'un puzzle (notre "catalogue")
export interface PuzzleDefinition {
  id: string;
  type: string;
  description: string;
  // La fonction qui détermine si l'action du joueur est correcte
  successCondition: (payload: any, gameState: any) => boolean;
  // La liste des effets à appliquer en cas de succès
  effects: Effect[];
  // Les indices pour ce puzzle
  hints: Hint;
  // Le module auquel ce puzzle appartient
  moduleId: 'energy' | 'system' | 'navigation';
}

// --- Définition des Puzzles pour CryoStation 9 ---

export const PuzzleCatalog: Record<string, PuzzleDefinition> = {
  // --- ACTE I ---
  ACT1_ENERGY_CIRCUITS: {
    id: 'ACT1_ENERGY_CIRCUITS',
    type: 'circuit_connect',
    description: "Relier les 3 nœuds d'énergie pour rétablir le flux.",
    moduleId: 'energy',
    successCondition: (payload, gameState) => {
      const correctConnections = ['A-C', 'C-F', 'A-F']; // Exemple de solution

      if (!payload.connections || !Array.isArray(payload.connections)) {
        return false;
      }

      const sortedPayloadConnections = payload.connections
        .map((c: string) => c.split('-').sort().join('-'))
        .sort();
      const sortedCorrectConnections = correctConnections
        .map((c) => c.split('-').sort().join('-'))
        .sort();

      return (
        JSON.stringify(sortedPayloadConnections) ===
          JSON.stringify(sortedCorrectConnections) &&
        gameState.modules.energy.puzzles.ACT1_ENERGY_CIRCUITS.state !== 'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT1_ENERGY_CIRCUITS', state: 'solved' },
      },
      {
        type: 'SET_MODULE_STATUS',
        payload: { moduleId: 'energy', status: 'unstable' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act1_energy_circuits_success' },
      },
      { type: 'UNLOCK_PUZZLE', payload: { puzzleId: 'ACT1_ENERGY_CODE_B7' } },
    ],
    hints: {
      level1: 'Les schémas électriques suivent souvent des chemins logiques.',
      level2:
        "Essayez de connecter le nœud de départ au nœud d'arrivée en passant par le centre.",
      level3: 'La solution est : A -> C -> F.',
    },
  },
  ACT1_ENERGY_CODE_B7: {
    id: 'ACT1_ENERGY_CODE_B7',
    type: 'code_entry',
    description: 'Entrer le protocole B7 pour calibrer la ligne secondaire.',
    moduleId: 'energy',
    successCondition: (payload, gameState) => {
      return (
        payload.code === '593-Alpha' &&
        gameState.modules.system.puzzles.ACT1_SYSTEM_LOG_B7.state === 'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT1_ENERGY_CODE_B7', state: 'solved' },
      },
      {
        type: 'SET_MODULE_STATUS',
        payload: { moduleId: 'energy', status: 'stabilized' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act1_energy_code_success' },
      },
      { type: 'ADVANCE_PHASE', payload: { phase: 'act2' } },
    ],
    hints: {
      level1: 'Le code doit se trouver dans une autre salle.',
      level2:
        'La salle Système contient des logs de diagnostic. Cherchez une ligne qui clignote.',
      level3: 'Le code est 593-Alpha.',
    },
  },
  ACT1_SYSTEM_LOG_B7: {
    id: 'ACT1_SYSTEM_LOG_B7',
    type: 'log_reading',
    description: 'Lire le log pour trouver le protocole B7.',
    moduleId: 'system',
    successCondition: (payload, gameState) => {
      return (
        gameState.modules.system.puzzles.ACT1_SYSTEM_LOG_B7.state !== 'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT1_SYSTEM_LOG_B7', state: 'solved' },
      },
      { type: 'EMIT_LYRA_MESSAGE', payload: { key: 'act1_system_log_found' } },
    ],
    hints: {
      level1: 'Parcourez les différents logs disponibles sur le terminal.',
      level2: 'Le message pertinent clignote brièvement avant de disparaître.',
      level3: 'Le log est intitulé "Protocole B7".',
    },
  },

  // --- ACTE II ---
  ACT2_ENERGY_LEVER: {
    id: 'ACT2_ENERGY_LEVER',
    type: 'lever_hold',
    description: 'Maintenir le levier pour stabiliser le flux.',
    moduleId: 'energy',
    successCondition: (payload, gameState) => {
      return (
        payload.action === 'complete' &&
        gameState.modules.energy.status === 'stabilized' &&
        gameState.modules.energy.puzzles.ACT2_ENERGY_LEVER.state !== 'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT2_ENERGY_LEVER', state: 'solved' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act2_energy_lever_success' },
      },
      {
        type: 'UNLOCK_PUZZLE',
        payload: { puzzleId: 'ACT2_SYSTEM_CALIBRATION' },
      },
    ],
    hints: {
      level1: 'Un appui long est nécessaire.',
      level2:
        'Ne relâchez pas avant que la lumière dans la salle Système ne soit allumée.',
      level3:
        "Maintenez le levier pendant qu'un autre joueur calibre les fréquences.",
    },
  },
  ACT2_SYSTEM_CALIBRATION: {
    id: 'ACT2_SYSTEM_CALIBRATION',
    type: 'frequency_match',
    description: 'Faire correspondre les fréquences.',
    moduleId: 'system',
    successCondition: (payload, gameState) => {
      const targetValues = { frequency: 4.2, amplitude: 1.5, phase: 180 };
      return (
        payload.frequency === targetValues.frequency &&
        payload.amplitude === targetValues.amplitude &&
        payload.phase === targetValues.phase &&
        gameState.modules.system.puzzles.ACT2_SYSTEM_CALIBRATION.state !==
          'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT2_SYSTEM_CALIBRATION', state: 'solved' },
      },
      {
        type: 'SET_MODULE_STATUS',
        payload: { moduleId: 'system', status: 'stabilized' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act2_system_calibration_success' },
      },
      { type: 'UNLOCK_PUZZLE', payload: { puzzleId: 'ACT2_SYSTEM_ROUTING' } },
    ],
    hints: {
      level1: 'Les valeurs à reproduire ne se trouvent pas dans cette salle.',
      level2:
        'Le joueur de la salle Énergie doit vous communiquer les valeurs.',
      level3: 'Fréquence: 4.2, Amplitude: 1.5, Phase: 180.',
    },
  },
  ACT2_SYSTEM_ROUTING: {
    id: 'ACT2_SYSTEM_ROUTING',
    type: 'power_routing',
    description: "Router l'énergie vers la navigation.",
    moduleId: 'system',
    successCondition: (payload, gameState) => {
      return (
        gameState.modules.system.status === 'stabilized' &&
        gameState.modules.system.puzzles.ACT2_SYSTEM_ROUTING.state !== 'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT2_SYSTEM_ROUTING', state: 'solved' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act2_system_routing_success' },
      },
      { type: 'UNLOCK_PUZZLE', payload: { puzzleId: 'ACT2_NAVIGATION_DIALS' } },
    ],
    hints: {
      level1: 'Connectez les modules pour créer un chemin vers "NAVIGATION".',
      level2: 'Tous les connecteurs doivent être utilisés.',
      level3:
        'Le chemin correct est : Sortie Énergie -> Relais A -> NAVIGATION.',
    },
  },
  ACT2_NAVIGATION_DIALS: {
    id: 'ACT2_NAVIGATION_DIALS',
    type: 'dial_adjustment',
    description: 'Ajuster les cadrans orbitaux.',
    moduleId: 'navigation',
    successCondition: (payload, gameState) => {
      return (
        payload.vector === 0 &&
        gameState.modules.navigation.puzzles.ACT2_NAVIGATION_DIALS.state !==
          'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT2_NAVIGATION_DIALS', state: 'solved' },
      },
      {
        type: 'SET_MODULE_STATUS',
        payload: { moduleId: 'navigation', status: 'stabilized' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act2_navigation_dials_success' },
      },
      { type: 'ADVANCE_PHASE', payload: { phase: 'act3' } },
    ],
    hints: {
      level1: 'Seul un cadran semble crucial pour la stabilisation.',
      level2: 'Le vecteur doit être ramené à une position neutre.',
      level3: 'Ajustez le cadran "Vecteur" à 0°.',
    },
  },

  // --- ACTE III ---
  ACT3_ENERGY_CRANK: {
    id: 'ACT3_ENERGY_CRANK',
    type: 'crank_turn',
    description: 'Tourner la manivelle pour alimenter le système.',
    moduleId: 'energy',
    successCondition: (payload, gameState) => {
      return (
        payload.action === 'complete' &&
        gameState.modules.energy.status === 'stabilized' &&
        gameState.modules.energy.puzzles.ACT3_ENERGY_CRANK.state !== 'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT3_ENERGY_CRANK', state: 'solved' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act3_energy_crank_success' },
      },
    ],
    hints: {
      level1: 'Cette action nécessite une alimentation manuelle continue.',
      level2:
        'La manivelle doit être tournée pendant que les coordonnées sont saisies.',
      level3: 'Maintenez la manivelle pendant 15 secondes cumulées.',
    },
  },
  ACT3_SYSTEM_TRAJECTORY: {
    id: 'ACT3_SYSTEM_TRAJECTORY',
    type: 'trajectory_calculation',
    description: 'Calculer les valeurs de correction de trajectoire.',
    moduleId: 'system',
    successCondition: (payload, gameState) => {
      const correctValues = { x: 17, y: 3.2, z: 5 };
      return (
        payload.x === correctValues.x &&
        payload.y === correctValues.y &&
        payload.z === correctValues.z &&
        gameState.modules.system.puzzles.ACT3_SYSTEM_TRAJECTORY.state !==
          'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT3_SYSTEM_TRAJECTORY', state: 'solved' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act3_system_trajectory_success' },
      },
      {
        type: 'UNLOCK_PUZZLE',
        payload: { puzzleId: 'ACT3_NAVIGATION_COORDS' },
      },
    ],
    hints: {
      level1: 'Un ancien log trouvé précédemment contient un indice.',
      level2:
        'Cherchez un log mentionnant un angle, une distance et une impulsion.',
      level3: 'X=17, Y=3.2, Z=5.',
    },
  },
  ACT3_NAVIGATION_COORDS: {
    id: 'ACT3_NAVIGATION_COORDS',
    type: 'coords_submission',
    description: 'Saisir les coordonnées de correction.',
    moduleId: 'navigation',
    successCondition: (payload, gameState) => {
      const correctValues = { x: 17, y: 3.2, z: 5 };
      return (
        payload.x === correctValues.x &&
        payload.y === correctValues.y &&
        payload.z === correctValues.z &&
        gameState.modules.system.puzzles.ACT3_SYSTEM_TRAJECTORY.state ===
          'solved' &&
        gameState.modules.navigation.puzzles.ACT3_NAVIGATION_COORDS.state !==
          'solved'
      );
    },
    effects: [
      {
        type: 'SET_PUZZLE_STATE',
        payload: { puzzleId: 'ACT3_NAVIGATION_COORDS', state: 'solved' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act3_navigation_coords_success' },
      },
      { type: 'OPEN_SYNC_WINDOW', payload: {} },
    ],
    hints: {
      level1:
        'Le joueur de la salle Système doit vous fournir les coordonnées.',
      level2: 'Entrez les 3 valeurs (X, Y, Z) dans le clavier.',
      level3: 'X: 17, Y: 3.2, Z: 5.',
    },
  },
  ACT3_FINAL_SYNC: {
    id: 'ACT3_FINAL_SYNC',
    type: 'synchronization',
    description: 'Synchronisation finale pour lancer la séquence.',
    moduleId: 'navigation',
    successCondition: () => false, // Logique gérée manuellement dans l'API
    effects: [
      { type: 'ADVANCE_PHASE', payload: { phase: 'epilogue' } },
      {
        type: 'SET_MODULE_STATUS',
        payload: { moduleId: 'navigation', status: 'stabilized' },
      },
      {
        type: 'EMIT_LYRA_MESSAGE',
        payload: { key: 'act3_final_sync_success' },
      },
      {
        type: 'SET_GAUGE',
        payload: { energy: 100, structure: 100, stability: 100 },
      },
    ],
    hints: {
      level1: 'Tous les joueurs doivent appuyer en même temps.',
      level2: 'Vous avez un délai très court pour vous synchroniser.',
      level3:
        'Appuyez sur "Activer" en même temps que vos coéquipiers (moins de 3 secondes d\'écart).',
    },
  },
};

// --- Fonctions utilitaires pour les puzzles ---

export const initializeModules = (
  phase: Room['phase']
): Record<string, any> => {
  const modules: Record<string, any> = {
    energy: { status: 'offline', puzzles: {} },
    system: { status: 'offline', puzzles: {} },
    navigation: { status: 'offline', puzzles: {} },
  };

  if (phase === 'intro' || phase === 'act1') {
    modules.energy.puzzles.ACT1_ENERGY_CIRCUITS = {
      id: 'ACT1_ENERGY_CIRCUITS',
      type: 'circuit_connect',
      state: 'locked',
      data: {},
    };
    modules.energy.puzzles.ACT1_ENERGY_CODE_B7 = {
      id: 'ACT1_ENERGY_CODE_B7',
      type: 'code_entry',
      state: 'locked',
      data: {},
    };
    modules.system.puzzles.ACT1_SYSTEM_LOG_B7 = {
      id: 'ACT1_SYSTEM_LOG_B7',
      type: 'log_reading',
      state: 'locked',
      data: {},
    };
  }
  if (phase === 'act2') {
    modules.energy.status = 'stabilized';
    modules.system.status = 'offline';
    modules.navigation.status = 'offline';
    modules.energy.puzzles.ACT2_ENERGY_LEVER = {
      id: 'ACT2_ENERGY_LEVER',
      type: 'lever_hold',
      state: 'locked',
      data: {},
    };
    modules.system.puzzles.ACT2_SYSTEM_CALIBRATION = {
      id: 'ACT2_SYSTEM_CALIBRATION',
      type: 'frequency_match',
      state: 'locked',
      data: {},
    };
    modules.system.puzzles.ACT2_SYSTEM_ROUTING = {
      id: 'ACT2_SYSTEM_ROUTING',
      type: 'power_routing',
      state: 'locked',
      data: {},
    };
    modules.navigation.puzzles.ACT2_NAVIGATION_DIALS = {
      id: 'ACT2_NAVIGATION_DIALS',
      type: 'dial_adjustment',
      state: 'locked',
      data: {},
    };
  }
  if (phase === 'act3') {
    modules.energy.status = 'stabilized';
    modules.system.status = 'stabilized';
    modules.navigation.status = 'stabilized';
    modules.energy.puzzles.ACT3_ENERGY_CRANK = {
      id: 'ACT3_ENERGY_CRANK',
      type: 'crank_turn',
      state: 'locked',
      data: {},
    };
    modules.system.puzzles.ACT3_SYSTEM_TRAJECTORY = {
      id: 'ACT3_SYSTEM_TRAJECTORY',
      type: 'trajectory_calculation',
      state: 'locked',
      data: {},
    };
    modules.navigation.puzzles.ACT3_NAVIGATION_COORDS = {
      id: 'ACT3_NAVIGATION_COORDS',
      type: 'coords_submission',
      state: 'locked',
      data: {},
    };
  }

  return modules;
};

export { PuzzleCatalog as CryoStation9Puzzles };
