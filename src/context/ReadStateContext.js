/**
 * ReadStateContext
 * ----------------
 * Persists the set of notification IDs the user has already viewed
 * in localStorage so the read/unread distinction survives page refreshes.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import logger from '../utils/logger';

const STORAGE_KEY = 'campus_read_ids';
const CONTEXT_NAME = 'ReadStateContext';

const ReadStateContext = createContext(null);

export function ReadStateProvider({ children }) {
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      logger.debug(CONTEXT_NAME, `Loaded ${parsed.length} read IDs from localStorage`);
      return new Set(parsed);
    } catch (e) {
      logger.warn(CONTEXT_NAME, 'Failed to load read IDs from localStorage', { error: e.message });
      return new Set();
    }
  });

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds]));
      logger.debug(CONTEXT_NAME, `Persisted ${readIds.size} read IDs to localStorage`);
    } catch (e) {
      logger.warn(CONTEXT_NAME, 'Failed to persist read IDs', { error: e.message });
    }
  }, [readIds]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      logger.debug(CONTEXT_NAME, `Marking notification ${id} as read`);
      return new Set([...prev, id]);
    });
  }, []);

  const markAllRead = useCallback((ids) => {
    setReadIds((prev) => {
      const next = new Set([...prev, ...ids]);
      logger.info(CONTEXT_NAME, `Marking ${ids.length} notifications as read`);
      return next;
    });
  }, []);

  const isRead = useCallback((id) => readIds.has(id), [readIds]);

  const unreadCount = useCallback(
    (notifications) => notifications.filter((n) => !isRead(n.id)).length,
    [isRead],
  );

  return (
    <ReadStateContext.Provider value={{ readIds, markRead, markAllRead, isRead, unreadCount }}>
      {children}
    </ReadStateContext.Provider>
  );
}

export function useReadState() {
  const ctx = useContext(ReadStateContext);
  if (!ctx) throw new Error('useReadState must be used within ReadStateProvider');
  return ctx;
}
