import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Button, Divider,
  Slider, Stack, Tooltip, Alert, Paper,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { usePriorityInbox }   from '../hooks/usePriorityInbox';
import NotificationCard       from '../components/NotificationCard';
import TypeFilter             from '../components/TypeFilter';
import LoadingSkeletons       from '../components/LoadingSkeletons';
import ErrorMessage           from '../components/ErrorMessage';
import EmptyState             from '../components/EmptyState';
import logger                 from '../utils/logger';

function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function PriorityInboxPage() {
  const [n,    setN]    = useState(10);
  const [type, setType] = useState('all');

  const { topNotifications, loading, error, lastUpdated, refresh } =
    usePriorityInbox({ n, notification_type: type });

  useEffect(() => {
    logger.info('PriorityInboxPage', 'Page mounted');
    return () => logger.info('PriorityInboxPage', 'Page unmounted');
  }, []);

  useEffect(() => {
    logger.info('PriorityInboxPage', `Config changed → n=${n} type=${type}`);
  }, [n, type]);

  const typeBreakdown = topNotifications.reduce((acc, notif) => {
    acc[notif.notification_type] = (acc[notif.notification_type] ?? 0) + 1;
    return acc;
  }, {});

  const TYPE_COLORS = { placement: '#7b1fa2', result: '#1565c0', event: '#2e7d32' };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      {/* ── header ── */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <TrophyIcon sx={{ color: '#f9a825', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
              Priority Inbox
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Top {n} unread notifications by importance
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {lastUpdated && (
            <Tooltip title={`Scores last refreshed at ${formatTime(lastUpdated)}`}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <TimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled">
                  {formatTime(lastUpdated)}
                </Typography>
              </Box>
            </Tooltip>
          )}
          <Tooltip title="Refresh & re-score">
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

      {/* ── algorithm info banner ── */}
      <Alert
        icon={<InfoIcon fontSize="small" />}
        severity="info"
        sx={{ mb: 2, fontSize: 12, py: 0.5 }}
      >
        Priority = <strong>60% type weight</strong> (Placement &gt; Result &gt; Event) +{' '}
        <strong>40% recency</strong> (exponential decay). Scores refresh every 60 s.
      </Alert>

      {/* ── controls ── */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          {/* top-n slider */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2" fontWeight={500} fontSize={13}>
                Show top-n notifications
              </Typography>
              <Chip
                label={`n = ${n}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700, height: 22, fontSize: 12 }}
              />
            </Box>
            <Slider
              value={n}
              min={5}
              max={20}
              step={5}
              marks={[
                { value: 5,  label: '5'  },
                { value: 10, label: '10' },
                { value: 15, label: '15' },
                { value: 20, label: '20' },
              ]}
              onChange={(_, v) => setN(v)}
              sx={{ color: '#1a237e' }}
            />
          </Box>

          {/* type filter */}
          <Box>
            <Typography variant="body2" fontWeight={500} fontSize={13} mb={0.75}>
              Filter by type
            </Typography>
            <TypeFilter value={type} onChange={setType} />
          </Box>
        </Stack>
      </Paper>

      {/* ── type breakdown chips ── */}
      {!loading && topNotifications.length > 0 && (
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {Object.entries(typeBreakdown).map(([t, count]) => (
            <Chip
              key={t}
              label={`${t}: ${count}`}
              size="small"
              sx={{
                bgcolor: TYPE_COLORS[t] ?? '#757575',
                color:   'white',
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* ── content ── */}
      {error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : loading ? (
        <LoadingSkeletons count={n > 10 ? 8 : 5} />
      ) : topNotifications.length === 0 ? (
        <EmptyState message="No unread notifications found. Great — you're all caught up!" />
      ) : (
        <Box>
          {topNotifications.map((notif, idx) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              rank={idx + 1}
              showScore
            />
          ))}
        </Box>
      )}

      {/* ── footer ── */}
      {!loading && !error && topNotifications.length > 0 && (
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          mt={2}
        >
          Showing {topNotifications.length} of top {n} priority notifications
        </Typography>
      )}
    </Box>
  );
}
