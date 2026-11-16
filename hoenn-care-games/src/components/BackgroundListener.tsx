import {useEffect} from 'react';
import {
  getCurrentPlayer,
  onSdkReady,
  openGameWindow,
  showNotificationToast,
  subscribeResultBroadcast,
  subscribeStartBroadcast,
} from '../sdk/obrClient';
import {STRINGS} from '../strings';

/**
 * Invisible background listener page (/background.html).
 * Filters incoming "hoenn-care/start" broadcasts by targetPlayerIds
 * and opens game.html as a modal (falling back to popover) for targeted clients.
 * For GM clients, also surfaces OBR.notification.show toasts on "hoenn-care/result".
 */
export function BackgroundListener() {
  useEffect(() => {
    let unsubStart: (() => void) | undefined;
    let unsubResult: (() => void) | undefined;
    let mounted = true;

    onSdkReady(() => {
      void (async () => {
        const me = await getCurrentPlayer();
        if (!mounted) return;

        unsubStart = subscribeStartBroadcast((msg) => {
          if (!Array.isArray(msg.targetPlayerIds)) return;
          if (!msg.targetPlayerIds.includes(me.id)) return;

          void openGameWindow({
            sessionId: msg.sessionId,
            game: msg.game,
            speciesId: msg.speciesId,
            feedCount: msg.feedCount,
            playerId: me.id,
            playerName: me.name,
          });
        });

        if (me.role === 'GM') {
          unsubResult = subscribeResultBroadcast((res) => {
            const gameLabel =
              res.game === 'calm' ? STRINGS.gm.gameCalmLabel : STRINGS.gm.gameFeedLabel;
            const outcomeLabel =
              res.outcome === 'success'
                ? STRINGS.gm.outcomeSuccess
                : STRINGS.gm.outcomeFail;
            const stageText = res.stageLabel ?? `${STRINGS.common.stage} ${res.stage}`;
            void showNotificationToast(
              `${res.playerName} · ${gameLabel} (${stageText}) — ${outcomeLabel} (${res.accuracy}%)`,
              res.outcome === 'success' ? 'SUCCESS' : 'WARNING',
            );
          });
        }
      })();
    });

    return () => {
      mounted = false;
      unsubStart?.();
      unsubResult?.();
    };
  }, []);

  return null;
}
