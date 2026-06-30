import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  Badge, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Notifications as NotifIcon,
  EmojiEvents as PriorityIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ unreadCount = 0 }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('sm'));

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: '#1a237e',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
        {/* brand */}
        <Box display="flex" alignItems="center" gap={1} mr={3}>
          <NotifIcon sx={{ fontSize: 24, color: '#90caf9' }} />
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            fontWeight={700}
            color="white"
            sx={{ letterSpacing: -0.3 }}
          >
            {isMobile ? 'CampusNotify' : 'Campus Notifications'}
          </Typography>
        </Box>

        <Box flex={1} />

        {/* nav links */}
        <Box display="flex" gap={0.5}>
          <Button
            onClick={() => navigate('/')}
            startIcon={!isMobile && <NotifIcon />}
            sx={{
              color:          isActive('/') ? '#90caf9' : 'rgba(255,255,255,0.8)',
              fontWeight:     isActive('/') ? 700 : 400,
              textTransform:  'none',
              fontSize:       isMobile ? 13 : 14,
              borderBottom:   isActive('/') ? '2px solid #90caf9' : '2px solid transparent',
              borderRadius:   0,
              px:             isMobile ? 1 : 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
            }}
          >
            {isMobile ? (
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                <NotifIcon sx={{ fontSize: 20 }} />
              </Badge>
            ) : (
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                All
              </Badge>
            )}
          </Button>

          <Button
            onClick={() => navigate('/priority')}
            startIcon={!isMobile && <PriorityIcon />}
            sx={{
              color:         isActive('/priority') ? '#ffcc02' : 'rgba(255,255,255,0.8)',
              fontWeight:    isActive('/priority') ? 700 : 400,
              textTransform: 'none',
              fontSize:      isMobile ? 13 : 14,
              borderBottom:  isActive('/priority') ? '2px solid #ffcc02' : '2px solid transparent',
              borderRadius:  0,
              px:            isMobile ? 1 : 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
            }}
          >
            {isMobile ? <PriorityIcon sx={{ fontSize: 20 }} /> : 'Priority Inbox'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
