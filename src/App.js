import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { ReadStateProvider, useReadState } from './context/ReadStateContext';
import Navbar                              from './components/Navbar';
import AllNotificationsPage               from './pages/AllNotificationsPage';
import PriorityInboxPage                  from './pages/PriorityInboxPage';
import { fetchNotifications }             from './utils/api';
import logger                             from './utils/logger';

// ── MUI Theme ──────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: '#1a237e' },
    secondary:  { main: '#7b1fa2' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

// ── inner app (needs ReadStateContext) ────────────────────────────────────────
function AppInner() {
  const { isRead } = useReadState();
  const [totalUnread, setTotalUnread] = useState(0);

  // approximate unread count for navbar badge
  useEffect(() => {
    async function loadBadgeCount() {
      try {
        const { notifications } = await fetchNotifications({ limit: 50, page: 1 });
        const unread = notifications.filter((n) => !isRead(n.id) && !n.is_read).length;
        setTotalUnread(unread);
        logger.debug('App', `Navbar badge count: ${unread} unread in first page`);
      } catch (e) {
        logger.warn('App', 'Failed to load badge count', { error: e.message });
      }
    }
    loadBadgeCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <Navbar unreadCount={totalUnread} />
      <Box component="main">
        <Routes>
          <Route path="/"         element={<AllNotificationsPage />} />
          <Route path="/priority" element={<PriorityInboxPage />} />
          {/* fallback */}
          <Route path="*"         element={<AllNotificationsPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

// ── root ───────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    logger.info('App', 'Application initialised', {
      env: process.env.NODE_ENV,
      url: window.location.href,
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReadStateProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </ReadStateProvider>
    </ThemeProvider>
  );
}
