import OBR from '@owlbear-rodeo/sdk';
import {CHANNELS, GAME_WINDOW_ID, MODAL_SIZE} from '../config';
import type {PlayerInfo, ResultMessage, SessionLaunchParams, StartMessage} from '../types';

type BusListener<T> = (payload: T) => void;

export interface PreviewToast {
  id: string;
  message: string;
  variant: 'DEFAULT' | 'ERROR' | 'INFO' | 'SUCCESS' | 'WARNING';
}

/**
 * In-memory event bus used strictly when OBR.isAvailable is false
 * (e.g. inside the AI Studio preview harness). Never persists to localStorage
 * and never runs inside a real Owlbear Rodeo room.
 */
class PreviewBus {
  private startListeners = new Set<BusListener<StartMessage>>();
  private resultListeners = new Set<BusListener<ResultMessage>>();
  private toastListeners = new Set<BusListener<PreviewToast>>();
  private launchListeners = new Set<BusListener<SessionLaunchParams>>();
  private partyListeners = new Set<BusListener<PlayerInfo[]>>();

  private virtualPlayers: PlayerInfo[] = [
    {id: 'player-ryono', name: 'Ryono', role: 'PLAYER', color: '#1BA8B5'},
    {id: 'player-peter-plant', name: 'Peter Plant', role: 'PLAYER', color: '#2E8B57'},
    {id: 'player-tanaka-aeri', name: 'Tanaka Aeri', role: 'PLAYER', color: '#E4002B'},
    {id: 'player-jouqui-llapart', name: "Jouqui L'lapart", role: 'PLAYER', color: '#1E4FD8'},
    {id: 'player-ryuma', name: 'Ryuma', role: 'PLAYER', color: '#FFC72C'},
    {id: 'player-elina-yozora', name: 'Elina Yozora', role: 'PLAYER', color: '#7ED957'},
  ];

  private activePreviewPlayerId = 'player-ryono';

  public getPlayers(): PlayerInfo[] {
    return [...this.virtualPlayers];
  }

  public getActivePreviewPlayer(): PlayerInfo {
    return (
      this.virtualPlayers.find((p) => p.id === this.activePreviewPlayerId) ??
      this.virtualPlayers[0]
    );
  }

  public setActivePreviewPlayerId(playerId: string): void {
    this.activePreviewPlayerId = playerId;
    this.emitParty();
  }

  public onPartyChange(cb: BusListener<PlayerInfo[]>): () => void {
    this.partyListeners.add(cb);
    return () => {
      this.partyListeners.delete(cb);
    };
  }

  private emitParty(): void {
    const list = this.getPlayers();
    this.partyListeners.forEach((cb) => cb(list));
  }

  public emitStart(msg: StartMessage): void {
    this.startListeners.forEach((cb) => cb(msg));
  }

  public onStart(cb: BusListener<StartMessage>): () => void {
    this.startListeners.add(cb);
    return () => {
      this.startListeners.delete(cb);
    };
  }

  public emitResult(msg: ResultMessage): void {
    this.resultListeners.forEach((cb) => cb(msg));
  }

  public onResult(cb: BusListener<ResultMessage>): () => void {
    this.resultListeners.add(cb);
    return () => {
      this.resultListeners.delete(cb);
    };
  }

  public emitToast(
    message: string,
    variant: PreviewToast['variant'] = 'INFO',
  ): void {
    const toast: PreviewToast = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      variant,
    };
    this.toastListeners.forEach((cb) => cb(toast));
  }

  public onToast(cb: BusListener<PreviewToast>): () => void {
    this.toastListeners.add(cb);
    return () => {
      this.toastListeners.delete(cb);
    };
  }

  public requestPreviewLaunch(params: SessionLaunchParams): void {
    this.launchListeners.forEach((cb) => cb(params));
  }

  public onPreviewLaunch(cb: BusListener<SessionLaunchParams>): () => void {
    this.launchListeners.add(cb);
    return () => {
      this.launchListeners.delete(cb);
    };
  }
}

export const previewBus = new PreviewBus();

export function isOwlbearAvailable(): boolean {
  try {
    return Boolean(OBR.isAvailable);
  } catch {
    return false;
  }
}

export function onSdkReady(callback: () => void): void {
  if (isOwlbearAvailable()) {
    OBR.onReady(callback);
  } else {
    queueMicrotask(callback);
  }
}

export async function getCurrentPlayer(): Promise<PlayerInfo> {
  if (!isOwlbearAvailable()) {
    return previewBus.getActivePreviewPlayer();
  }
  const [id, name, role] = await Promise.all([
    OBR.player.getId(),
    OBR.player.getName(),
    OBR.player.getRole(),
  ]);
  return {id, name, role};
}

export async function getPartyPlayers(): Promise<PlayerInfo[]> {
  if (!isOwlbearAvailable()) {
    return previewBus.getPlayers();
  }
  const players = await OBR.party.getPlayers();
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    color: p.color,
  }));
}

export function subscribePartyPlayers(cb: (players: PlayerInfo[]) => void): () => void {
  if (!isOwlbearAvailable()) {
    return previewBus.onPartyChange(cb);
  }
  return OBR.party.onChange((players) => {
    cb(
      players.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        color: p.color,
      })),
    );
  });
}

export async function sendStartBroadcast(message: StartMessage): Promise<void> {
  if (!isOwlbearAvailable()) {
    previewBus.emitStart(message);
    return;
  }
  await OBR.broadcast.sendMessage(CHANNELS.START, message, {destination: 'ALL'});
}

export function subscribeStartBroadcast(cb: (msg: StartMessage) => void): () => void {
  if (!isOwlbearAvailable()) {
    return previewBus.onStart(cb);
  }
  return OBR.broadcast.onMessage(CHANNELS.START, (event) => {
    if (event.data && typeof event.data === 'object') {
      cb(event.data as StartMessage);
    }
  });
}

export async function sendResultBroadcast(message: ResultMessage): Promise<void> {
  if (!isOwlbearAvailable()) {
    previewBus.emitResult(message);
    return;
  }
  await OBR.broadcast.sendMessage(CHANNELS.RESULT, message, {destination: 'ALL'});
}

export function subscribeResultBroadcast(cb: (msg: ResultMessage) => void): () => void {
  if (!isOwlbearAvailable()) {
    return previewBus.onResult(cb);
  }
  return OBR.broadcast.onMessage(CHANNELS.RESULT, (event) => {
    if (event.data && typeof event.data === 'object') {
      cb(event.data as ResultMessage);
    }
  });
}

export function buildGameUrl(params: SessionLaunchParams): string {
  const query = new URLSearchParams({
    sessionId: params.sessionId,
    game: params.game,
    speciesId: params.speciesId,
    feedCount: String(params.feedCount),
  });
  if (params.playerId) query.set('playerId', params.playerId);
  if (params.playerName) query.set('playerName', params.playerName);
  return `/game.html?${query.toString()}`;
}

export function parseGameUrlParams(): SessionLaunchParams | null {
  if (typeof window === 'undefined') return null;
  const sp = new URLSearchParams(window.location.search);
  const game = sp.get('game');
  if (game !== 'calm' && game !== 'feed') {
    return null;
  }
  const speciesId = (sp.get('speciesId') ?? 'random') as SessionLaunchParams['speciesId'];
  const parsedCount = Number.parseInt(sp.get('feedCount') ?? '3', 10);
  const feedCount = Number.isFinite(parsedCount) ? parsedCount : 3;
  return {
    sessionId: sp.get('sessionId') ?? `session-${Date.now()}`,
    game,
    speciesId,
    feedCount,
    playerId: sp.get('playerId') ?? undefined,
    playerName: sp.get('playerName') ?? undefined,
  };
}

export async function openGameWindow(params: SessionLaunchParams): Promise<void> {
  if (!isOwlbearAvailable()) {
    previewBus.requestPreviewLaunch(params);
    return;
  }
  const url = buildGameUrl(params);
  try {
    await OBR.modal.open({
      id: GAME_WINDOW_ID,
      url,
      width: MODAL_SIZE.width,
      height: MODAL_SIZE.height,
    });
  } catch {
    // Fallback to popover when modal opening is not possible
    await OBR.popover.open({
      id: GAME_WINDOW_ID,
      url,
      width: MODAL_SIZE.width,
      height: MODAL_SIZE.height,
      disableClickAway: true,
    });
  }
}

export async function closeGameWindow(): Promise<void> {
  if (!isOwlbearAvailable()) {
    return;
  }
  try {
    await OBR.modal.close(GAME_WINDOW_ID);
  } catch {
    // Ignore if it was opened as a popover instead
  }
  try {
    await OBR.popover.close(GAME_WINDOW_ID);
  } catch {
    // Ignore if it was opened as a modal
  }
}

export async function showNotificationToast(
  message: string,
  variant: 'DEFAULT' | 'ERROR' | 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO',
): Promise<void> {
  if (!isOwlbearAvailable()) {
    previewBus.emitToast(message, variant);
    return;
  }
  await OBR.notification.show(message, variant);
}
