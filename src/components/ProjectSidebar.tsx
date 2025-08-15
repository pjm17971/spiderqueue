import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import { Folder as FolderIcon, Add as AddIcon } from '@mui/icons-material';
import type { Project } from '../types';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onCreateProject: (name: string, description?: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  onCreateProject
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = () => setIsCreateDialogOpen(true);

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setNewProjectName('');
    setNewProjectDescription('');
  };

  const handleSubmitProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      handleCloseDialog();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">Projects</Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {projects.map((project) => (
            <ListItem key={project.id} disablePadding>
              <ListItemButton
                selected={selectedProject?.id === project.id}
                onClick={() => onProjectSelect(project)}
                sx={{ '&.Mui-selected': { backgroundColor: 'primary.main', color: 'primary.contrastText', '&:hover': { backgroundColor: 'primary.dark' } } }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FolderIcon sx={{ color: selectedProject?.id === project.id ? 'primary.contrastText' : 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={project.name}
                  secondary={project.description}
                  primaryTypographyProps={{ noWrap: true, sx: { fontWeight: selectedProject?.id === project.id ? 'bold' : 'normal' } }}
                  secondaryTypographyProps={{ noWrap: true, sx: { color: selectedProject?.id === project.id ? 'primary.contrastText' : 'text.secondary', opacity: selectedProject?.id === project.id ? 0.7 : 1 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={handleCreateProject} sx={{ justifyContent: 'flex-start' }}>
          Create Project
        </Button>
      </Box>

      <Dialog open={isCreateDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Project Name" fullWidth variant="outlined" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} sx={{ mb: 2 }} />
          <TextField margin="dense" label="Description (optional)" fullWidth variant="outlined" multiline rows={3} value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitProject} variant="contained" disabled={!newProjectName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectSidebar;

