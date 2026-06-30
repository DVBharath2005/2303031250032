import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import {
  NotificationsNone as AllIcon,
  Work as PlacementIcon,
  Assessment as ResultIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const TYPES = [
  { value: 'all',       label: 'All',       Icon: AllIcon },
  { value: 'placement', label: 'Placement',  Icon: PlacementIcon },
  { value: 'result',    label: 'Result',     Icon: ResultIcon },
  { value: 'event',     label: 'Event',      Icon: EventIcon },
];

const TYPE_COLOR = {
  all:       '#1976d2',
  placement: '#7b1fa2',
  result:    '#1565c0',
  event:     '#2e7d32',
};

export default function TypeFilter({ value, onChange }) {
  return (
    <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => v && onChange(v)}
        size="small"
        sx={{
          flexWrap:  'nowrap',
          gap:       0.5,
          '& .MuiToggleButtonGroup-grouped': {
            border:       '1px solid #e0e0e0 !important',
            borderRadius: '20px !important',
            px:           1.5,
            py:           0.5,
            textTransform: 'none',
            fontSize:     12,
            fontWeight:   500,
            color:        '#616161',
            '&.Mui-selected': {
              color:   '#fff',
              bgcolor: TYPE_COLOR[value] ?? '#1976d2',
              '&:hover': { bgcolor: TYPE_COLOR[value] ?? '#1565c0' },
            },
          },
        }}
      >
        {TYPES.map(({ value: v, label, Icon }) => (
          <ToggleButton key={v} value={v} disableRipple>
            <Icon sx={{ fontSize: 14, mr: 0.5 }} />
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
