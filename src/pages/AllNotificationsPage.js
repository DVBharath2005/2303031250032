import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Pagination, Select, MenuItem,
  FormControl, InputLabel, Chip, Button, Divider,
  Tooltip, Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  DoneAll as MarkAllIcon,
} from '@mui/icons-material';
import { useNotifications }      from '../hooks/useNotifications';
import { useReadState }          from '../context/ReadStateContext';
import NotificationCard          from '../components/NotificationCard';
import TypeFilter                from '../components/TypeFilter';
import LoadingSkeletons          from '../components/LoadingSkeletons';
import ErrorMessage              from '../components/ErrorMessage';
import EmptyState                from '../components/EmptyState';
import logger                    from '../utils/logger';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export default function AllNotificationsPage() {
  const [type,  setType]  = useState('all');
  const [limit, setLimit] = useState(20);
  const { markAllRead, unreadCount } = useReadState();

  const { notifications, total, page, loading, error, goToPage, refresh } =
    useNotifications({ limit, notification_type: type });

  // log page view
  useEffect(() => {
    logger.info('AllNotificationsPage', 'Page mounted');
    return () => logger.info('AllNotificationsPage', 'Page unmounted');
  }, []);

  useEffect(() => {
    logger.info('AllNotificationsPage', `Filter changed → type=${type} limit=${limit}`);
  }, [type, limit]);

  const totalPages = Math.ceil(total / limit) || 1;
  const currentUnread = unreadCount(notifications);

  function handleMarkAllRead() {
    const ids = notifications.map((n) => n.id);
    markAllRead(ids);
    logger.info('AllNotificationsPage', `Marked all ${ids.length} visible notifications as read`);
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      {/* ── header ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            All Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {total > 0 ? `${total} total` : 'Loading…'}
            {currentUnread > 0 && (
              <Chip
                label={`${currentUnread} unread`}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {currentUnread > 0 && (
            <Tooltip title="Mark visible as read">
              <Button
                size="small"
                startIcon={<MarkAllIcon />}
                onClick={handleMarkAllRead}
                variant="outlined"
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                Mark read
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Refresh">
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refresh}
              disabled={loading}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              Refresh
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── filters row ── */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={2}
        flexWrap="wrap"
      >
        <TypeFilter value={type} onChange={(v) => { setType(v); }} />

        <FormControl size="small" sx={{ minWidth: 100, ml: 'auto' }}>
          <InputLabel sx={{ fontSize: 13 }}>Per page</InputLabel>
          <Select
            value={limit}
            label="Per page"
            onChange={(e) => setLimit(Number(e.target.value))}
            sx={{ fontSize: 13 }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ── content ── */}
      {error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : loading ? (
        <LoadingSkeletons count={limit > 10 ? 8 : limit} />
      ) : notifications.length === 0 ? (
        <EmptyState message="No notifications found for the selected filter." />
      ) : (
        <Box>
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </Box>
      )}

      {/* ── pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => goToPage(p)}
            color="primary"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            size="small"
          />
        </Box>
      )}

      {/* ── footer info ── */}
      {!loading && !error && notifications.length > 0 && (
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          mt={2}
        >
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </Typography>
      )}
    </Box>
  );
}
