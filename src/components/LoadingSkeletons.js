import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

export default function LoadingSkeletons({ count = 5 }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} elevation={0} sx={{ mb: 1.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" gap={1.5}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Box display="flex" gap={1} mb={0.5}>
                  <Skeleton variant="rounded" width={60} height={18} />
                  <Skeleton variant="rounded" width={80} height={18} sx={{ ml: 'auto' }} />
                </Box>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="95%" height={16} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
