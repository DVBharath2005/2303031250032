import React from 'react';
import { Box, Typography } from '@mui/material';
import { NotificationsOff as EmptyIcon } from '@mui/icons-material';

export default function EmptyState({ message = 'No notifications found' }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      color="text.disabled"
    >
      <EmptyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
