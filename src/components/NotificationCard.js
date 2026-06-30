import React from 'react';
import {
  Card, CardContent, CardActionArea, Box, Typography,
  Chip, Tooltip, Avatar,
} from '@mui/material';
import {
  Work as PlacementIcon,
  Assessment as ResultIcon,
  Event as EventIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { useReadState } from '../context/ReadStateContext';
import logger from '../utils/logger';

const TYPE_CONFIG = {
  placement: {
    label:  'Placement',
    color:  '#7b1fa2',
    bg:     '#f3e5f5',
    Icon:   PlacementIcon,
    border: '#ce93d8',
  },
  result: {
    label:  'Result',
    color:  '#1565c0',
    bg:     '#e3f2fd',
    Icon:   ResultIcon,
    border: '#90caf9',
  },
  event: {
    label:  'Event',
    color:  '#2e7d32',
    bg:     '#e8f5e9',
    Icon:   EventIcon,
    border: '#a5d6a7',
  },
};

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60)       return `${s}s ago`;
  if (s < 3600)     return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)    return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationCard({ notification, showScore = false, rank }) {
  const { isRead, markRead } = useReadState();
  const read = isRead(notification.id);
  const cfg  = TYPE_CONFIG[notification.notification_type] ?? TYPE_CONFIG.event;
  const { Icon } = cfg;

  function handleClick() {
    if (!read) {
      logger.info('NotificationCard', `User viewed notification id=${notification.id}`);
      markRead(notification.id);
    }
  }

  return (
    <Card
      elevation={read ? 0 : 2}
      sx={{
        mb: 1.5,
        border:      `1px solid ${read ? '#e0e0e0' : cfg.border}`,
        borderLeft:  `4px solid ${read ? '#bdbdbd' : cfg.color}`,
        borderRadius: 2,
        opacity:     read ? 0.75 : 1,
        transition:  'all 0.2s ease',
        '&:hover':   { elevation: 4, transform: 'translateY(-1px)' },
        position:    'relative',
        bgcolor:     read ? '#fafafa' : '#ffffff',
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ p: 0 }}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" alignItems="flex-start" gap={1.5}>
            {/* avatar */}
            <Avatar
              sx={{
                bgcolor:    read ? '#e0e0e0' : cfg.bg,
                width:  40,
                height: 40,
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <Icon sx={{ color: read ? '#9e9e9e' : cfg.color, fontSize: 20 }} />
            </Avatar>

            {/* content */}
            <Box flex={1} minWidth={0}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.25}>
                {/* rank badge for priority inbox */}
                {rank != null && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize:   11,
                      fontWeight: 700,
                      color:      '#fff',
                      bgcolor:    cfg.color,
                      borderRadius: 1,
                      px: 0.75,
                      py: 0.1,
                      lineHeight: 1.6,
                    }}
                  >
                    #{rank}
                  </Typography>
                )}

                <Chip
                  label={cfg.label}
                  size="small"
                  sx={{
                    fontSize:    10,
                    height:      18,
                    fontWeight:  600,
                    bgcolor:     read ? '#eeeeee' : cfg.bg,
                    color:       read ? '#757575' : cfg.color,
                    border:      `1px solid ${read ? '#e0e0e0' : cfg.border}`,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />

                {/* unread dot */}
                {!read && (
                  <Tooltip title="Unread">
                    <DotIcon sx={{ fontSize: 10, color: cfg.color, ml: 'auto' }} />
                  </Tooltip>
                )}

                {/* time */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: read ? 'auto' : 0, whiteSpace: 'nowrap', fontSize: 11 }}
                >
                  {timeAgo(notification.created_at)}
                </Typography>
              </Box>

              {/* title */}
              <Typography
                variant="body2"
                fontWeight={read ? 400 : 600}
                color={read ? 'text.secondary' : 'text.primary'}
                noWrap
                sx={{ fontSize: 13.5, lineHeight: 1.4, mb: 0.25 }}
              >
                {notification.title}
              </Typography>

              {/* body */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display:           '-webkit-box',
                  WebkitLineClamp:   2,
                  WebkitBoxOrient:   'vertical',
                  overflow:          'hidden',
                  fontSize:          12,
                  lineHeight:        1.5,
                }}
              >
                {notification.message ?? notification.body ?? ''}
              </Typography>

              {/* score bar (priority inbox only) */}
              {showScore && notification._score != null && (
                <Box mt={0.75} display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                    Priority score
                  </Typography>
                  <Box
                    flex={1}
                    height={4}
                    bgcolor="#f0f0f0"
                    borderRadius={2}
                    overflow="hidden"
                  >
                    <Box
                      height="100%"
                      width={`${(notification._score * 100).toFixed(1)}%`}
                      bgcolor={cfg.color}
                      borderRadius={2}
                      sx={{ transition: 'width 0.6s ease' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                    {(notification._score * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
