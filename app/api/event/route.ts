// app/api/event/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from 'firebase-admin';
import { CryoStation9Puzzles } from '@/app/docs/puzzles';
import { LyraMessages } from './lyra-messages';

export async function POST(request: NextRequest) {
  try {
    const { idToken, roomId, kind, payload } = await request.json();

    if (!idToken || !roomId || !kind) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const roomRef = adminFirestore.collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return NextResponse.json(
        { ok: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    const roomData = { id: roomDoc.id, ...roomDoc.data() };

    const playerDoc = await roomRef.collection('players').doc(uid).get();
    if (!playerDoc.exists) {
      return NextResponse.json(
        { ok: false, error: 'Player not in room' },
        { status: 403 }
      );
    }
    const playerData = playerDoc.data();

    if (roomData.status !== 'running') {
      return NextResponse.json(
        { ok: false, error: 'Room not running' },
        { status: 400 }
      );
    }

    const playersSnapshot = await roomRef
      .collection('players')
      .where('connected', '==', true)
      .get();
    const connectedPlayers = playersSnapshot.size;

    if (connectedPlayers !== roomData.requiredPlayers) {
      return NextResponse.json(
        { ok: false, error: 'Incorrect number of players' },
        { status: 400 }
      );
    }

    const result = await processIntent(
      kind,
      payload,
      roomData,
      uid,
      playerData
    );

    await roomRef.collection('events').add({
      ts: adminFirestore.FieldValue.serverTimestamp(),
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
  const phase = roomData.phase;
  const modules = roomData.modules || {};
  const batch = adminFirestore.batch();
  const roomUpdatePayload: any = {};

  // --- CAS SPÉCIAL : Gestion manuelle de la synchronisation finale ---
  if (kind === 'ACT3_FINAL_SYNC') {
    if (payload.action === 'start') {
      if (roomData.syncWindow?.isOpen) {
        return { ok: false, error: 'Sync window already open' };
      }
      roomUpdatePayload.syncWindow = {
        isOpen: true,
        startedBy: uid,
        startedAt: adminFirestore.FieldValue.serverTimestamp(),
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
      if (roomData.syncWindow.startedAt.toMillis() + 3000 < Date.now()) {
        return { ok: false, error: 'Sync window expired' };
      }

      const syncedPlayers = roomData.syncWindow.syncedPlayers || [];
      if (syncedPlayers.includes(uid)) {
        return { ok: false, error: 'Player already synced' };
      }
      syncedPlayers.push(uid);
      roomUpdatePayload['syncWindow.syncedPlayers'] = syncedPlayers;

      if (syncedPlayers.length === roomData.requiredPlayers) {
        // Succès ! On applique les effets du puzzle
        const puzzleDef = CryoStation9Puzzles.ACT3_FINAL_SYNC;
        for (const effect of puzzleDef.effects) {
          await applyEffect(
            effect,
            roomRef,
            roomData,
            batch,
            roomUpdatePayload
          );
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

  // --- LOGIQUE STANDARD POUR LES AUTRES PUZZLES ---
  const puzzleDef = CryoStation9Puzzles[kind];
  if (!puzzleDef) {
    if (kind === 'ADVANCE_PHASE') {
      if (roomData.hostUid !== uid)
        return { ok: false, error: 'Only host can advance phase' };
      return await advancePhase(roomRef, payload.phase);
    }
    return { ok: false, error: 'Unknown intent kind' };
  }

  const inferredPhase = kind.split('_')[0].toLowerCase().replace('act', '');
  if (inferredPhase !== phase.replace('act', '')) {
    return { ok: false, error: 'Puzzle not available in current phase' };
  }

  if (playerData.currentRoom !== puzzleDef.moduleId) {
    return { ok: false, error: 'Action not allowed in this room' };
  }

  const module = modules[puzzleDef.moduleId] || {};
  if (module.status === 'offline' && puzzleDef.id !== 'ACT1_ENERGY_CIRCUITS') {
    return { ok: false, error: 'Module offline' };
  }

  const puzzleState = module.puzzles?.find(
    (p: any) => p.id === puzzleDef.id
  ) || {
    id: puzzleDef.id,
    state: 'locked',
    data: {},
  };

  if (puzzleState.state === 'solved') {
    return { ok: true, effects: [] };
  }

  const gameState = { ...roomData, modules };
  const isSuccess = puzzleDef.successCondition(payload, gameState);

  const effects: any[] = [];

  if (isSuccess) {
    puzzleState.state = 'solved';
    puzzleState.data = { ...puzzleState.data, ...payload };
    for (const effect of puzzleDef.effects) {
      effects.push(
        await applyEffect(effect, roomRef, roomData, batch, roomUpdatePayload)
      );
    }
  } else {
    puzzleState.state = 'solving';
    puzzleState.data = { ...puzzleState.data, ...payload };
    const errorMessage = getLyraErrorMessage(puzzleDef.id, phase);
    if (errorMessage) {
      effects.push({ type: 'emitLyraMessage', message: errorMessage });
    }
  }

  const updatedPuzzles = [...(module.puzzles || [])];
  const puzzleIndex = updatedPuzzles.findIndex(
    (p: any) => p.id === puzzleDef.id
  );
  if (puzzleIndex >= 0) {
    updatedPuzzles[puzzleIndex] = puzzleState;
  } else {
    updatedPuzzles.push(puzzleState);
  }
  roomUpdatePayload[`modules.${puzzleDef.moduleId}.puzzles`] = updatedPuzzles;

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
  roomUpdatePayload: any
) {
  const { type, payload } = effect;
  switch (type) {
    case 'SET_MODULE_STATUS':
      roomUpdatePayload[`modules.${payload.moduleId}.status`] = payload.status;
      return { type, payload };
    case 'ADVANCE_PHASE':
      roomUpdatePayload.phase = payload.phase;
      return { type, payload: { phase: payload.phase } };
    case 'SET_GAUGE':
      roomUpdatePayload[`gauges.${payload.target}`] = payload.value;
      return { type, payload };
    case 'EMIT_LYRA_MESSAGE':
      return {
        type,
        message: payload.key ? LyraMessages[payload.key] : 'Message inconnu',
      };
    case 'UNLOCK_PUZZLE':
      const [moduleId] = payload.puzzleId.toLowerCase().split('_');
      const moduleToUnlock = roomData.modules[moduleId];
      if (moduleToUnlock?.puzzles) {
        const puzzleToUnlock = moduleToUnlock.puzzles.find(
          (p: any) => p.id === payload.puzzleId
        );
        if (puzzleToUnlock) {
          const puzzleIndex = moduleToUnlock.puzzles.indexOf(puzzleToUnlock);
          roomUpdatePayload[
            `modules.${moduleId}.puzzles.${puzzleIndex}.state`
          ] = 'solving';
        }
      }
      return { type, payload };
    default:
      console.warn('Unknown effect type:', type);
      return { type: 'unknown', effect };
  }
}

async function advancePhase(roomRef: any, newPhase: string) {
  await roomRef.update({ phase: newPhase });
  return { type: 'advancePhase', value: newPhase };
}

function getLyraErrorMessage(puzzleId: string, phase: string): string | null {
  const errorMessages: { [key: string]: { [key: string]: string } } = {
    ACT1_ENERGY_CIRCUITS: {
      act1: "Surtension détectée. Risque d'incendie accru.",
    },
    ACT1_ENERGY_CODE_B7: { act1: 'Code incorrect. Vérifiez les logs système.' },
    ACT2_SYSTEM_CALIBRATION: {
      act2: 'Erreur de phase. Les flux ne sont pas alignés.',
    },
    ACT2_NAVIGATION_DIALS: { act2: 'Dérive détectée. Ajustez les cadrans.' },
    ACT3_SYSTEM_TRAJECTORY: { act3: 'Calcul incorrect. Consultez les logs.' },
    ACT3_NAVIGATION_COORDS: { act3: 'Coordonnées invalides.' },
  };
  return errorMessages[puzzleId]?.[phase] || null;
}
