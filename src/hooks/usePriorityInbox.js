import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllNotifications } from '../utils/api';
import { getTopN } from '../utils/priority';
import { useReadState } from '../context/ReadStateContext';
import logger from '../utils/logger';

const HOOK_CTX = 'usePriorityInbox';
const REFRESH_INTERVAL_MS = 60 * 1000; // re-score every 60 s

export function usePriorityInbox({ n = 10, notification_type = 'all' } = {}) {
  const [topNotifications, setTopNotifications] = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);
  const [lastUpdated, setLastUpdated]           = useState(null);
  const { isRead }                              = useReadState();
  const allCacheRef                             = useRef([]); // cache for re-scoring
  const timerRef                                = useRef(null);

  // ── fetch + score ──────────────────────────────────────────────────────────
  const fetchAndScore = useCallback(
    async (type, topN) => {
      setLoading(true);
      setError(null);
      logger.info(HOOK_CTX, `Fetching all notifications for priority scoring (n=${topN})`);
      try {
        const all = await fetchAllNotifications(type);
        allCacheRef.current = all;
        // augment with frontend read state
        const withReadState = all.map((n) => ({
          ...n,
          is_read: isRead(n.id) || n.is_read,
        }));
        const top = getTopN(withReadState, topN);
        setTopNotifications(top);
        setLastUpdated(new Date());
        logger.info(HOOK_CTX, `Priority inbox computed: ${top.length} top notifications`);
      } catch (err) {
        logger.error(HOOK_CTX, 'Failed to compute priority inbox', { error: err.message });
        setError(err?.response?.data?.message ?? err.message ?? 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    },
    [isRead],
  );

  // ── re-score cached data (recency changes with time) ──────────────────────
  const rescore = useCallback(
    (topN) => {
      if (allCacheRef.current.length === 0) return;
      logger.debug(HOOK_CTX, 'Re-scoring cached notifications due to time decay');
      const withReadState = allCacheRef.current.map((n) => ({
        ...n,
        is_read: isRead(n.id) || n.is_read,
      }));
      const top = getTopN(withReadState, topN);
      setTopNotifications(top);
      setLastUpdated(new Date());
    },
    [isRead],
  );

  // initial load + when filter/n changes
  useEffect(() => {
    fetchAndScore(notification_type, n);
  }, [notification_type, n, fetchAndScore]);

  // periodic re-score
  useEffect(() => {
    timerRef.current = setInterval(() => rescore(n), REFRESH_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [n, rescore]);

  const refresh = useCallback(() => fetchAndScore(notification_type, n), [
    notification_type,
    n,
    fetchAndScore,
  ]);

  return { topNotifications, loading, error, lastUpdated, refresh };
}
