// app/api/event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/app/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { CryoStation9Puzzles } from '@/app/docs/puzzles';
import { LyraMessages } from './lyra-messages';

// Util: compter les joueurs connectés depuis une map
function countConnectedPlayers(players: Record<string, any> | undefined) {
  if (!players) return 0;
  return Object.values(players).filter((p: any) => p?.connected).length;
}

// Util: mapper un puzzleId -> moduleId ('energy' | 'system' | 'navigation')
function moduleIdFromPuzzleId(puzzleId: string): 'energy' | 'system' | 'navigation' {
  const parts = puzzleId.split('_');
  const mod = (parts[1] || '').toLowerCase();
  if (mod === 'energy') return 'energy';
  if (mod === 'system') return 'system';
  return 'navigation';
}

// Util: toMillis sécurisé (Timestamp Firestore ou Date/ISO)
function safeToMillis(v: any): number | null {
  if (!v) return null;
  if (typeof v?.toMillis === 'function') return v.toMillis();
  const t = new Date(v as any).getTime();
  return Number.isFinite(t) ? t : null;
}

export async function POST(request: NextRequest) {
  try {
    const { idToken, roomId, kind, payload } = await request.json();

    if (!idToken || !roomId || !kind) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Auth Firebase
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Room
    const roomRef = adminFirestore.collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    const roomData: any = { id: roomDoc.id, ...roomDoc.data() };

    // Vérifier appartenance à la room via la MAP players (pas sous-collection)
    const playerData = roomData.players?.[uid];
    if (!playerData) {
      return NextResponse.json(
        { ok: false, error: 'Player not in room' },
        { status: 403 }
      );
    }

    if (roomData.status !== 'running') {
      return NextResponse.json(
        { ok: false, error: 'Room not running' },
        { status: 400 }
      );
    }

    // Nombre exact de joueurs connectés (depuis la MAP)
    const connectedPlayers = countConnectedPlayers(roomData.players);
    if (connectedPlayers !== roomData.requiredPlayers) {
      return NextResponse.json(
        { ok: false, error: 'Incorrect number of players' },
        { status: 400 }
      );
    }

    // Dispatcher d'intentions
    const result = await processIntent(kind, payload, roomData, uid, playerData);

    // Journalisation
    await roomRef.collection('events').add({
      ts: FieldValue.serverTimestamp(),
      actor: uid,
      kind,
      payload,
      room: roomId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing event:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processIntent(
  kind: string,
  payload: any,
  roomData: any,
  uid: string,
  playerData: any
) {
  const roomRef = adminFirestore.collection('rooms').doc(roomData.id);
  const phase = roomData.phase as string;
  const modules = roomData.modules || {};
  const batch = adminFirestore.batch();
  const roomUpdatePayload: Record<string, any> = {};

  // ─────────────────────────────────────────
  // CAS SPÉCIAL : Synchronisation finale Acte 3
  // ─────────────────────────────────────────
  if (kind === 'ACT3_FINAL_SYNC') {
    if (payload.action === 'start') {
      if (roomData.syncWindow?.isOpen) {
        return { ok: false, error: 'Sync window already open' };
      }
      roomUpdatePayload.syncWindow = {
        isOpen: true,
        startedBy: uid,
        startedAt: FieldValue.serverTimestamp(),
        syncedPlayers: [],
      };
      batch.update(roomRef, roomUpdatePayload);
      await batch.commit();
      return { ok: true, effects: [{ type: 'OPEN_SYNC_WINDOW' }] };
    }

    if (payload.action === 'complete') {
      if (!roomData.syncWindow?.isOpen) {
        return { ok: false, error: 'Sync window is not open' };
      }
      const startedAtMs = safeToMillis(roomData.syncWindow.startedAt);
      if (!startedAtMs || startedAtMs + 3000 < Date.now()) {
        return { ok: false, error: 'Sync window expired' };
      }

      const syncedPlayers: string[] = Array.isArray(roomData.syncWindow.syncedPlayers)
        ? [...roomData.syncWindow.syncedPlayers]
        : [];
      if (syncedPlayers.includes(uid)) {
        return { ok: false, error: 'Player already synced' };
      }
      syncedPlayers.push(uid);
      roomUpdatePayload['syncWindow.syncedPlayers'] = syncedPlayers;

      if (syncedPlayers.length === roomData.requiredPlayers) {
        // Succès : appliquer les effets du puzzle final
        const puzzleDef = (CryoStation9Puzzles as any)['ACT3_FINAL_SYNC'];
        if (puzzleDef?.effects) {
          for (const effect of puzzleDef.effects) {
            await applyEffect(effect, roomRef, roomData, batch, roomUpdatePayload);
          }
        }
        roomUpdatePayload.syncWindow = { isOpen: false };
      }

      batch.update(roomRef, roomUpdatePayload);
      await batch.commit();

      const message =
        syncedPlayers.length === roomData.requiredPlayers
          ? 'Synchronisation réussie !'
          : `${syncedPlayers.length}/${roomData.requiredPlayers} joueurs synchronisés.`;
      return { ok: true, effects: [{ type: 'emitLyraMessage', message }] };
    }
  }

  // ─────────────────────────────────────────
  // LOGIQUE STANDARD PUZZLES
  // ─────────────────────────────────────────
  const puzzleDef = (CryoStation9Puzzles as any)[kind];
  if (!puzzleDef) {
    if (kind === 'ADVANCE_PHASE') {
      if (roomData.hostUid !== uid) {
        return { ok: false, error: 'Only host can advance phase' };
      }
      return await advancePhase(roomRef, payload.phase);
    }
    return { ok: false, error: 'Unknown intent kind' };
  }

  // Phase guard
  const inferredPhase = kind.split('_')[0].toLowerCase().replace('act', '');
  if (inferredPhase !== phase.replace('act', '')) {
    return { ok: false, error: 'Puzzle not available in current phase' };
  }

  // Salle / module guard
  const moduleId: 'energy' | 'system' | 'navigation' =
    (puzzleDef.moduleId as any) || moduleIdFromPuzzleId(puzzleDef.id);
  if (playerData.currentRoom !== moduleId) {
    return { ok: false, error: 'Action not allowed in this room' };
  }

  // Module & puzzle state (objets)
  const moduleState = modules[moduleId] || {};
  const puzzlesObj = moduleState.puzzles || {};
  const puzzleId = puzzleDef.id;

  const currentPuzzleState =
    puzzlesObj[puzzleId] || { id: puzzleId, state: 'locked', data: {} };

  if (currentPuzzleState.state === 'solved') {
    return { ok: true, effects: [] };
  }

  const gameState = { ...roomData, modules };
  const isSuccess = typeof puzzleDef.successCondition === 'function'
    ? puzzleDef.successCondition(payload, gameState)
    : false;

  const effects: any[] = [];

  if (isSuccess) {
    // Succès
    roomUpdatePayload[`modules.${moduleId}.puzzles.${puzzleId}.state`] = 'solved';
    roomUpdatePayload[`modules.${moduleId}.puzzles.${puzzleId}.data`] = {
      ...(currentPuzzleState.data || {}),
      ...payload,
    };

    if (Array.isArray(puzzleDef.effects)) {
      for (const effect of puzzleDef.effects) {
        const res = await applyEffect(effect, roomRef, roomData, batch, roomUpdatePayload);
        if (res) effects.push(res);
      }
    }
  } else {
    // En cours
    roomUpdatePayload[`modules.${moduleId}.puzzles.${puzzleId}.state`] = 'solving';
    roomUpdatePayload[`modules.${moduleId}.puzzles.${puzzleId}.data`] = {
      ...(currentPuzzleState.data || {}),
      ...payload,
    };

    const errorMessage = getLyraErrorMessage(puzzleDef.id, phase);
    if (errorMessage) {
      effects.push({ type: 'emitLyraMessage', message: errorMessage });
    }
  }

  if (Object.keys(roomUpdatePayload).length > 0) {
    batch.update(roomRef, roomUpdatePayload);
  }
  await batch.commit();

  return { ok: true, effects };
}

async function applyEffect(
  effect: any,
  roomRef: any,
  roomData: any,
  batch: any,
  roomUpdatePayload: Record<string, any>
) {
  const { type, payload } = effect;

  switch (type) {
    case 'SET_MODULE_STATUS': {
      roomUpdatePayload[`modules.${payload.moduleId}.status`] = payload.status;
      return { type, payload };
    }

    case 'ADVANCE_PHASE': {
      roomUpdatePayload.phase = payload.phase;
      return { type, payload: { phase: payload.phase } };
    }

    case 'SET_GAUGE': {
      roomUpdatePayload[`gauges.${payload.target}`] = payload.value;
      return { type, payload };
    }

    case 'EMIT_LYRA_MESSAGE': {
      const message =
        payload?.message ??
        (payload?.key ? (LyraMessages as any)[payload.key] : undefined) ??
        'Message inconnu';
      return { type: 'emitLyraMessage', message };
    }

    case 'UNLOCK_PUZZLE': {
      const targetPuzzleId: string = payload.puzzleId;
      const moduleId = payload.moduleId || moduleIdFromPuzzleId(targetPuzzleId);
      roomUpdatePayload[`modules.${moduleId}.puzzles.${targetPuzzleId}.state`] = 'solving';
      return { type, payload: { puzzleId: targetPuzzleId, moduleId } };
    }

    default: {
      console.warn('Unknown effect type:', type);
      return { type: 'unknown', effect };
    }
  }
}

async function advancePhase(roomRef: any, newPhase: string) {
  await roomRef.update({ phase: newPhase });
  return { type: 'advancePhase', value: newPhase };
}

function getLyraErrorMessage(puzzleId: string, phase: string): string | null {
  const errorMessages: { [key: string]: { [key: string]: string } } = {
    ACT1_ENERGY_CIRCUITS: { act1: "Surtension détectée. Risque d'incendie accru." },
    ACT1_ENERGY_CODE_B7: { act1: 'Code incorrect. Vérifiez les logs système.' },
    ACT2_SYSTEM_CALIBRATION: { act2: 'Erreur de phase. Les flux ne sont pas alignés.' },
    ACT2_NAVIGATION_DIALS: { act2: 'Dérive détectée. Ajustez les cadrans.' },
    ACT3_SYSTEM_TRAJECTORY: { act3: 'Calcul incorrect. Consultez les logs.' },
    ACT3_NAVIGATION_COORDS: { act3: 'Coordonnées invalides.' },
  };
  return errorMessages[puzzleId]?.[phase] || null;
}
