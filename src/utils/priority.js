/**
 * Priority scoring – mirrors the Stage 1 Python algorithm.
 * score = WEIGHT_FACTOR × (weight/max_weight) + RECENCY_FACTOR × e^(-age/half_life)
 */

const WEIGHT_MAP = { placement: 3, result: 2, event: 1 };
const MAX_WEIGHT = 3;
const WEIGHT_FACTOR = 0.6;
const RECENCY_FACTOR = 0.4;
const HALF_LIFE_MS = (7 * 24 * 3600 * 1000) / 4; // 1.75 days in ms

export function computeScore(notification) {
  const weight = WEIGHT_MAP[notification.notification_type] ?? 1;
  const weightScore = weight / MAX_WEIGHT;

  const ageMs = Math.max(0, Date.now() - new Date(notification.created_at).getTime());
  const recencyScore = Math.exp(-ageMs / HALF_LIFE_MS);

  return WEIGHT_FACTOR * weightScore + RECENCY_FACTOR * recencyScore;
}

/**
 * Returns the top-n unread notifications by priority score.
 * Uses a simple sort (n is always small ≤ 20).
 */
export function getTopN(notifications, n = 10) {
  return notifications
    .filter((notif) => !notif.is_read)
    .map((notif) => ({ ...notif, _score: computeScore(notif) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, n);
}

export const TYPE_WEIGHT_LABEL = {
  placement: { label: 'Placement', weight: 3, color: '#7b1fa2' },
  result:    { label: 'Result',    weight: 2, color: '#1565c0' },
  event:     { label: 'Event',     weight: 1, color: '#2e7d32' },
};
