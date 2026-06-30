/**
 * Notification API Service
 * -------------------------
 * Tries the real API first. If no valid token is configured (401 / auth error),
 * transparently falls back to local mock data so the UI always works.
 */

import axios from 'axios';
import logger from '../utils/logger';
import MOCK_NOTIFICATIONS from './mockData';

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'http://4.224.186.213/evaluation-service';

const API_TOKEN = (process.env.REACT_APP_API_TOKEN || '').trim();

const CONTEXT = 'NotificationService';

// ── axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  if (API_TOKEN) {
    config.headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }
  logger.debug(CONTEXT, `HTTP ${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    logger.debug(CONTEXT, `HTTP ${response.status} ← ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error(CONTEXT, 'HTTP error', {
      url:    error.config?.url,
      status: error.response?.status,
      msg:    error.message,
    });
    return Promise.reject(error);
  },
);

// ── helpers ────────────────────────────────────────────────────────────────────
function extractNotifications(raw) {
  if (Array.isArray(raw))               return { notifications: raw,              total: raw.length };
  if (Array.isArray(raw?.notifications)) return { notifications: raw.notifications, total: raw.total ?? raw.count ?? raw.notifications.length };
  if (Array.isArray(raw?.data))          return { notifications: raw.data,          total: raw.total ?? raw.count ?? raw.data.length };
  return { notifications: [], total: 0 };
}

function isAuthError(responseData) {
  if (!responseData || typeof responseData !== 'object') return false;
  const msg = (responseData.message ?? '').toLowerCase();
  return (
    msg.includes('authorization') ||
    msg.includes('token') ||
    msg.includes('unauthorized')
  );
}

// ── mock helpers ───────────────────────────────────────────────────────────────
function getMockPage({ limit, page, notification_type }) {
  let data = [...MOCK_NOTIFICATIONS];
  if (notification_type && notification_type !== 'all') {
    data = data.filter((n) => n.notification_type === notification_type);
  }
  const total  = data.length;
  const start  = (page - 1) * limit;
  const slice  = data.slice(start, start + limit);
  logger.info(CONTEXT, `[MOCK] Serving ${slice.length}/${total} notifications (page=${page})`);
  return { notifications: slice, total, page, limit };
}

function getMockAll(notification_type) {
  let data = [...MOCK_NOTIFICATIONS];
  if (notification_type && notification_type !== 'all') {
    data = data.filter((n) => n.notification_type === notification_type);
  }
  logger.info(CONTEXT, `[MOCK] Serving all ${data.length} notifications`);
  return data;
}

// ── public API ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated notifications.
 * Falls back to mock data if auth fails.
 */
export async function fetchNotifications({ limit = 20, page = 1, notification_type } = {}) {
  return logger.withLogging(CONTEXT, 'fetchNotifications', async () => {
    // skip real API if no token configured
    if (!API_TOKEN) {
      logger.warn(CONTEXT, 'No API token – using mock data');
      return getMockPage({ limit, page, notification_type });
    }

    try {
      const params = { limit, page };
      if (notification_type && notification_type !== 'all') {
        params.notification_type = notification_type;
      }
      const response = await api.get('/notifications', { params });
      const raw = response.data;

      // API responded 200 but with an auth error message
      if (isAuthError(raw)) {
        logger.warn(CONTEXT, 'API auth error – falling back to mock data', { msg: raw.message });
        return getMockPage({ limit, page, notification_type });
      }

      const { notifications, total } = extractNotifications(raw);
      logger.info(CONTEXT, `Fetched ${notifications.length} notifications (total=${total})`);
      return { notifications, total, page, limit };
    } catch (err) {
      // network error or 401 → fallback
      logger.warn(CONTEXT, `API call failed (${err.message}) – falling back to mock data`);
      return getMockPage({ limit, page, notification_type });
    }
  });
}

/**
 * Fetch ALL notifications (auto-paginating).
 * Falls back to mock data if auth fails.
 */
export async function fetchAllNotifications(notification_type = null) {
  return logger.withLogging(CONTEXT, 'fetchAllNotifications', async () => {
    if (!API_TOKEN) {
      logger.warn(CONTEXT, 'No API token – using mock data (fetchAll)');
      return getMockAll(notification_type);
    }

    try {
      const PAGE_SIZE = 50;
      let page = 1;
      let all  = [];
      let total = Infinity;

      while (all.length < total) {
        const params = { limit: PAGE_SIZE, page };
        if (notification_type && notification_type !== 'all') {
          params.notification_type = notification_type;
        }
        const response = await api.get('/notifications', { params });
        const raw = response.data;

        if (isAuthError(raw)) {
          logger.warn(CONTEXT, 'API auth error – falling back to mock data (fetchAll)');
          return getMockAll(notification_type);
        }

        const { notifications: batch, total: t } = extractNotifications(raw);
        total = t;
        if (batch.length === 0) break;
        all = all.concat(batch);
        page += 1;
        if (batch.length < PAGE_SIZE) break;
      }

      logger.info(CONTEXT, `fetchAllNotifications complete – ${all.length} notifications`);
      return all;
    } catch (err) {
      logger.warn(CONTEXT, `API call failed (${err.message}) – falling back to mock data (fetchAll)`);
      return getMockAll(notification_type);
    }
  });
}
