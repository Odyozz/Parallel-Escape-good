// Types fondamentaux du moteur de jeu

export type Phase = 'intro' | 'act1' | 'act2' | 'act3' | 'epilogue';
export type RoomId = 'cryo' | 'energy' | 'system' | 'navigation';
export type HotspotType = 'puzzle' | 'clue' | 'lure' | 'lore' | 'ambience';

export interface Hotspot {
  id: string;
  roomId: RoomId;
  x: number; // 0..1 (position relative)
  y: number;
  type: HotspotType;
  title: string;
  moduleId?: string;
  visible: boolean;
  disabled?: boolean;
  phaseGate?: Phase[];
}

export interface ModuleInstance {
  id: string;
  type: string;
  state: 'locked' | 'available' | 'solving' | 'solved';
  data?: Record<string, any>;
  crossLinks?: string[];
}

export interface RoomState {
  id: RoomId;
  unlocked: boolean;
  background: string;
}
