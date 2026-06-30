import React from 'react';
import { Alert, Box, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <Box py={3}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              color="error"
            >
              Retry
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </Box>
  );
}
