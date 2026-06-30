import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotifications } from '../utils/api';
import logger from '../utils/logger';

const HOOK_CTX = 'useNotifications';

export function useNotifications({ limit = 20, notification_type = 'all' } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(
    async (pageNum, type, lim) => {
      // cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      logger.info(HOOK_CTX, `Loading page=${pageNum} type=${type} limit=${lim}`);

      try {
        const result = await fetchNotifications({
          limit: lim,
          page:  pageNum,
          notification_type: type,
        });
        if (!controller.signal.aborted) {
          setNotifications(result.notifications);
          setTotal(result.total);
          logger.info(HOOK_CTX, `Loaded ${result.notifications.length} notifications`);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          logger.error(HOOK_CTX, 'Failed to load notifications', { error: err.message });
          setError(err?.response?.data?.message ?? err.message ?? 'Failed to fetch notifications');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [],
  );

  // reload when filter or limit changes → reset to page 1
  useEffect(() => {
    setPage(1);
    load(1, notification_type, limit);
  }, [notification_type, limit, load]);

  const goToPage = useCallback(
    (newPage) => {
      setPage(newPage);
      load(newPage, notification_type, limit);
    },
    [notification_type, limit, load],
  );

  const refresh = useCallback(() => {
    load(page, notification_type, limit);
  }, [page, notification_type, limit, load]);

  return { notifications, total, page, loading, error, goToPage, refresh };
}
