import React from 'react';
import { FormControl, Select, MenuItem, Box, Typography, SelectChangeEvent } from '@mui/material';

interface WorkspaceSelectorProps {
  workspaces: Array<{ id: string; name: string }>;
  selectedWorkspaceId: string;
  onSelectById: (workspaceId: string) => void;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  selectedWorkspaceId,
  onSelectById
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onSelectById(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" color="inherit">
        Workspace:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={selectedWorkspaceId || ''}
          onChange={handleChange}
          displayEmpty
          variant="outlined"
          sx={{
            color: 'white',
            '& .MuiSelect-select': {
              color: 'white',
              fontWeight: 700,
              py: 0.5,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.25)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.4)'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.6)'
            },
            '& .MuiSvgIcon-root': {
              color: 'white'
            },
            backgroundColor: 'transparent',
          }}
        >
          <MenuItem value="" disabled>
            <em>Select a workspace</em>
          </MenuItem>
          {workspaces.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default WorkspaceSelector;

