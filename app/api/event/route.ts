// app/api/event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// ─────────────────────────────────────────────────────────
// Types d’intentions supportées (data-driven, multi-modules)
// ─────────────────────────────────────────────────────────
type IntentKind =
  | 'HOTSPOT_INTERACT'   // ouverture d’un point cliquable
  | 'MODULE_ACTION'      // action interne au module (saisies, sliders…)
  | 'MODULE_SOLVE'       // validation d’un module/puzzle
  | 'SYNC_TRIGGER'       // synchronisation finale 3 salles (start/complete)
  | 'ADVANCE_PHASE';     // host uniquement (fallback)

type RoomId = 'cryo'|'energy'|'system'|'navigation';
type Phase = 'intro'|'act1'|'act2'|'act3'|'epilogue';

function countConnectedPlayers(players: Record<string, any> | undefined) {
  if (!players) return 0;
  return Object.values(players).filter((p: any) => p?.connected).length;
}
function safeToMillis(v: any): number | null {
  if (!v) return null;
  if (typeof v?.toMillis === 'function') return v.toMillis();
  const t = new Date(v as any).getTime();
  return Number.isFinite(t) ? t : null;
}

// ─────────────────────────────────────────────────────────
// POST /api/event
// ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { idToken, roomId, kind, payload } = await request.json();

    if (!idToken || !roomId || !kind) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Auth Firebase
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Room doc
    const roomRef = adminFirestore.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    }
    const room: any = { id: roomSnap.id, ...roomSnap.data() };

    // Player membership
    const player = room.players?.[uid];
    if (!player) {
      return NextResponse.json({ ok: false, error: 'Player not in room' }, { status: 403 });
    }

    if (room.status !== 'running') {
      return NextResponse.json({ ok: false, error: 'Room not running' }, { status: 400 });
    }

    // Check connected players equals required
    const connectedPlayers = countConnectedPlayers(room.players);
    if (connectedPlayers !== room.requiredPlayers) {
      return NextResponse.json({ ok: false, error: 'Incorrect number of players' }, { status: 400 });
    }

    // Dispatch
    const result = await processIntent(kind as IntentKind, payload ?? {}, room, uid);

    // Journalisation
    await roomRef.collection('events').add({
      ts: FieldValue.serverTimestamp(),
      actor: uid,
      kind,
      payload,
      room: roomId,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error('event error', e);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────
// Dispatcher d’intentions (hotspots/modules/synchro)
// ─────────────────────────────────────────────────────────
async function processIntent(
  kind: IntentKind,
  payload: any,
  room: any,
  uid: string
) {
  const roomRef = adminFirestore.collection('rooms').doc(room.id);
  const batch = adminFirestore.batch();
  const update: Record<string, any> = {};
  const effects: any[] = [];

  const phase: Phase = room.phase;
  const currentRoom: RoomId = (room.players?.[uid]?.currentRoom ?? 'cryo') as RoomId;

  // Guards faciles à vivre
  const assertRoomUnlocked = (rid: RoomId) => {
    const unlocked = room.unlockedRooms?.[rid];
    if (!unlocked) throw new Error(`Room ${rid} is locked`);
  };

  switch (kind) {
    // ─────────────────────────────────────────────────────
    // 1) Ouverture d’un hotspot : log + éventuels effets visuels
    // ─────────────────────────────────────────────────────
    case 'HOTSPOT_INTERACT': {
      const { hotspotId } = payload as { hotspotId: string };
      if (!hotspotId) return { ok: false, error: 'Missing hotspotId' };
      assertRoomUnlocked(currentRoom);

      // Optionnel : marquer le hotspot “vu” par ce joueur
      update[`players.${uid}.seen.${hotspotId}`] = true;

      // Émettre un petit message Lyra si on a un mapping côté client
      effects.push({ type: 'lyra', message: lyraAuto(hotspotId, phase) });
      break;
    }

    // ─────────────────────────────────────────────────────
    // 2) Action interne au module (pas encore solved)
    // ─────────────────────────────────────────────────────
    case 'MODULE_ACTION': {
      const { moduleId, data } = payload as { moduleId: string; data: any };
      if (!moduleId) return { ok: false, error: 'Missing moduleId' };
      assertRoomUnlocked(currentRoom);

      // On merge les data “tentatives”
      update[`modules.${moduleId}.state`] = 'solving';
      update[`modules.${moduleId}.data`] = {
        ...(room.modules?.[moduleId]?.data ?? {}),
        ...sanitizeModuleData(data),
      };
      break;
    }

    // ─────────────────────────────────────────────────────
    // 3) Validation d’un module/puzzle
    // ─────────────────────────────────────────────────────
    case 'MODULE_SOLVE': {
      const { moduleId, proof } = payload as { moduleId: string; proof?: any };
      if (!moduleId) return { ok: false, error: 'Missing moduleId' };
      assertRoomUnlocked(currentRoom);

      const moduleState = room.modules?.[moduleId] ?? {};
      if (moduleState.state === 'solved') {
        return { ok: true, effects: [] };
      }

      // Validation “serveur” ultra simple ici (ex: NumericPad = 593A)
      const ok = validateModuleServer(moduleId, proof, room);
      if (!ok) {
        effects.push({ type: 'lyra', message: 'Code incorrect. Recommencez.' });
        break;
      }

      // Succès → marquer solved + appliquer effets de progression
      update[`modules.${moduleId}.state`] = 'solved';
      update[`modules.${moduleId}.solvedAt`] = FieldValue.serverTimestamp();

      // Effets possibles selon le module (exemples diégétiques)
      const solvedEffects = computeModuleEffects(moduleId, room);
      for (const eff of solvedEffects) {
        applyEffect(eff, update);
        effects.push(renderEffectToClient(eff));
      }
      break;
    }

    // ─────────────────────────────────────────────────────
    // 4) Synchronisation finale 3 salles (start/complete)
    // ─────────────────────────────────────────────────────
    case 'SYNC_TRIGGER': {
      const action = payload?.action as 'start'|'complete';
      if (!action) return { ok: false, error: 'Missing action' };

      const ref = adminFirestore.collection('rooms').doc(room.id);

      // START : ouvrons une fenêtre de 3 secondes
      if (action === 'start') {
        if (room.syncWindow?.isOpen) return { ok: false, error: 'Sync window already open' };
        update.syncWindow = {
          isOpen: true,
          startedBy: uid,
          startedAt: FieldValue.serverTimestamp(),
          syncedPlayers: [],
        };
        batch.update(ref, update);
        await batch.commit();
        return { ok: true, effects: [{ type: 'sync_open' }] };
      }

      // COMPLETE : on enregistre le joueur dans la fenêtre, et on valide si tout le monde a cliqué
      if (!room.syncWindow?.isOpen) return { ok: false, error: 'Sync window not open' };
      const startedAtMs = safeToMillis(room.syncWindow.startedAt);
      if (!startedAtMs || startedAtMs + 3000 < Date.now()) {
        return { ok: false, error: 'Sync window expired' };
      }

      const synced: string[] = Array.isArray(room.syncWindow.syncedPlayers) ? [...room.syncWindow.syncedPlayers] : [];
      if (!synced.includes(uid)) synced.push(uid);
      update['syncWindow.syncedPlayers'] = synced;

      // Tout le monde ?
      if (synced.length === room.requiredPlayers) {
        // On ferme et on passe en épilogue + full gauges
        update.syncWindow = { isOpen: false };
        update.phase = 'epilogue';
        update['gauges.energy'] = 100;
        update['gauges.structure'] = 100;
        update['gauges.stability'] = 100;
        effects.push({ type: 'lyra', message: 'Synchronisation réussie.' });
      } else {
        effects.push({ type: 'lyra', message: `${synced.length}/${room.requiredPlayers} synchronisés…` });
      }
      break;
    }

    // ─────────────────────────────────────────────────────
    // 5) Fallback host : avancer de phase manuellement
    // ─────────────────────────────────────────────────────
    case 'ADVANCE_PHASE': {
      if (room.hostUid !== uid) return { ok: false, error: 'Only host can advance phase' };
      const p = (payload?.phase as Phase) || 'act1';
      update.phase = p;
      effects.push({ type: 'phase', phase: p });
      break;
    }

    default:
      return { ok: false, error: 'Unknown intent kind' };
  }

  // Écriture Firestore
  const ref = adminFirestore.collection('rooms').doc(room.id);
  if (Object.keys(update).length > 0) {
    await ref.update(update);
  }

  return { ok: true, effects };
}

// ─────────────────────────────────────────────────────────
// Helpers “serveur” minimalistes (tu pourras enrichir)
// ─────────────────────────────────────────────────────────
function sanitizeModuleData(data: any) {
  if (!data || typeof data !== 'object') return {};
  // whitelist minimale si besoin
  return data;
}

function validateModuleServer(moduleId: string, proof: any, room: any) {
  // Exemple : panneau réacteur NumericPad → 593A
  if (moduleId === 'numeric_pad') {
    return (proof?.code ?? '').toString().toUpperCase() === '593A';
  }
  // Ajoute ici d’autres validations (freq_calibrator, orbital_console, etc.)
  return true;
}

type Effect =
  | { type: 'UNLOCK_ROOM'; roomId: RoomId }
  | { type: 'SET_MODULE_STATE'; moduleId: string; state: 'available'|'solving'|'solved' }
  | { type: 'SET_HOTSPOT_VISIBLE'; hotspotId: string; visible: boolean }
  | { type: 'ADVANCE_PHASE'; phase: Phase }
  | { type: 'SET_GAUGE'; key: 'energy'|'structure'|'stability'; value: number };

function computeModuleEffects(moduleId: string, room: any): Effect[] {
  // Exemple de chaînes d’effets : quand le code NumericPad est résolu en énergie,
  // on déverrouille la salle "system" + on rend visibles 2 hotspots utiles là-bas.
  if (moduleId === 'numeric_pad') {
    return [
      { type: 'UNLOCK_ROOM', roomId: 'system' },
      { type: 'SET_GAUGE', key: 'energy', value: Math.min(100, (room?.gauges?.energy ?? 40) + 30) },
    ];
  }
  return [];
}

function applyEffect(eff: Effect, update: Record<string, any>) {
  switch (eff.type) {
    case 'UNLOCK_ROOM':
      update[`unlockedRooms.${eff.roomId}`] = true;
      break;
    case 'SET_MODULE_STATE':
      update[`modules.${eff.moduleId}.state`] = eff.state;
      break;
    case 'SET_HOTSPOT_VISIBLE':
      update[`hotspots.${eff.hotspotId}.visible`] = eff.visible;
      break;
    case 'ADVANCE_PHASE':
      update.phase = eff.phase;
      break;
    case 'SET_GAUGE':
      update[`gauges.${eff.key}`] = eff.value;
      break;
  }
}

function renderEffectToClient(eff: Effect) {
  // Effets “lisibles” côté client (pour retours UI/Lyra)
  switch (eff.type) {
    case 'UNLOCK_ROOM': return { type: 'unlockRoom', roomId: eff.roomId };
    case 'SET_MODULE_STATE': return { type: 'moduleState', moduleId: eff.moduleId, state: eff.state };
    case 'SET_HOTSPOT_VISIBLE': return { type: 'hotspotVisible', hotspotId: eff.hotspotId, visible: eff.visible };
    case 'ADVANCE_PHASE': return { type: 'phase', phase: eff.phase };
    case 'SET_GAUGE': return { type: 'gauge', key: eff.key, value: eff.value };
  }
}

function lyraAuto(hotspotId: string, phase: Phase) {
  // Mapping minimal (à étoffer).
  if (phase === 'act1' && hotspotId.includes('reactor')) return 'Flux instable. Protocole requis.';
  if (phase === 'act1' && hotspotId.includes('log')) return 'Fragment du protocole détecté.';
  return 'Analyse en cours…';
}
