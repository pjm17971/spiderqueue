import React from 'react';
import {
  Box,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Button,
  Chip,
  Stack,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  List as ListIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { User } from '../types';

interface FilterBarProps {
  filterView: 'home' | 'person' | 'list';
  onFilterViewChange: (view: 'home' | 'person' | 'list') => void;
  selectedPeople: string[];
  onPeopleChange: (event: SelectChangeEvent<string[]>) => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onCreateTicket: () => void;
  users: User[];
  showListControls: boolean;
  projectName?: string;
  personMode?: 'overview' | 'assign';
  onPersonModeChange?: (mode: 'overview' | 'assign') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterView,
  onFilterViewChange,
  selectedPeople,
  onPeopleChange,
  searchText,
  onSearchTextChange,
  selectedTags,
  onTagsChange,
  onCreateTicket,
  users,
  showListControls,
  projectName,
  personMode,
  onPersonModeChange
}) => {
  const handleTagDelete = (tagToDelete: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToDelete));
  };

  const handleTagAdd = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      const newTag = event.currentTarget.value.trim();
      if (!selectedTags.includes(newTag)) {
        onTagsChange([...selectedTags, newTag]);
      }
      event.currentTarget.value = '';
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, mx: 2, mt: 2, backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {/* View Selection */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            View:
          </Typography>
          <RadioGroup row value={filterView} onChange={(e) => onFilterViewChange(e.target.value as 'home' | 'person' | 'list')}>
            <FormControlLabel
              value="home"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HomeIcon fontSize="small" />
                  <Typography variant="body2">{projectName || 'Home'}</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="person"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="small" />
                  <Typography variant="body2">My Queue</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="list"
              control={<Radio size="small" />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ListIcon fontSize="small" />
                  <Typography variant="body2">List</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* Person mode controls */}
        {filterView === 'person' && (
          <>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Mode:</Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={personMode || 'overview'}
                onChange={(_, v) => v && onPersonModeChange && onPersonModeChange(v)}
              >
                <ToggleButton value="overview">Overview</ToggleButton>
                <ToggleButton value="assign">Assign</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </>
        )}

        <Divider orientation="vertical" flexItem />

        {/* List Controls - Only show when list view is selected */}
        {showListControls && (
          <>
            {/* People Selector */}
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>People</InputLabel>
                <Select
                  multiple
                  value={selectedPeople}
                  onChange={onPeopleChange}
                  label="People"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const user = users.find(u => u.id === value);
                        return (
                          <Chip key={value} label={user?.name || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Search */}
            <Box sx={{ minWidth: 200 }}>
              <TextField size="small" placeholder="Search tickets..." value={searchText} onChange={(e) => onSearchTextChange(e.target.value)} fullWidth />
            </Box>

            {/* Tags */}
            <Box sx={{ minWidth: 200 }}>
              <TextField
                size="small"
                placeholder="Add tags (press Enter)"
                onKeyPress={handleTagAdd}
                fullWidth
                InputProps={{
                  startAdornment: selectedTags.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
                      {selectedTags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" onDelete={() => handleTagDelete(tag)} />
                      ))}
                    </Stack>
                  ),
                }}
              />
            </Box>
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Create Ticket Button */}
        <Button variant="contained" startIcon={<CreateIcon />} onClick={onCreateTicket} sx={{ ml: 'auto' }}>
          Create Ticket
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterBar;
