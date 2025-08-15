import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  SwapHoriz as LentIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  SwapHoriz
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Ticket, User, Project } from '../types';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  users: User[];
  projects: Project[];
}

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  onClose,
  users,
  projects
}) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLendDialogOpen, setIsLendDialogOpen] = useState(false);
  const [assignComment, setAssignComment] = useState('');
  const [lendComment, setLendComment] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedLendTarget, setSelectedLendTarget] = useState<string>('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inbox': return '#2196f3';
      case 'hold': return '#ff9800';
      case 'on-deck': return '#9c27b0';
      case 'in-progress': return '#4caf50';
      case 'done': return '#8bc34a';
      default: return '#9e9e9e';
    }
  };

  const assignedUser = users.find(u => u.id === ticket.assignedTo);
  const createdByUser = users.find(u => u.id === ticket.createdBy);
  const project = projects.find(p => p.id === ticket.projectId);

  const handleAssign = () => {
    setIsAssignDialogOpen(true);
  };

  const handleLend = () => {
    setIsLendDialogOpen(true);
  };

  const handleAssignSubmit = () => {
    // In a real app, this would call an API
    console.log('Assigning ticket:', { ticketId: ticket.id, assignee: selectedAssignee, comment: assignComment });
    setIsAssignDialogOpen(false);
    setAssignComment('');
    setSelectedAssignee('');
  };

  const handleLendSubmit = () => {
    // In a real app, this would call an API
    console.log('Lending ticket:', { ticketId: ticket.id, target: selectedLendTarget, comment: lendComment });
    setIsLendDialogOpen(false);
    setLendComment('');
    setSelectedLendTarget('');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
      onClick={onClose}
    >
      <Paper
        sx={{
          width: '80%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {ticket.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={ticket.status}
                  size="small"
                  sx={{ backgroundColor: getStatusColor(ticket.status), color: 'white' }}
                />
                <Chip
                  label={ticket.priority}
                  size="small"
                  sx={{ backgroundColor: getPriorityColor(ticket.priority), color: 'white' }}
                />
                {ticket.type === 'lent' && (
                  <Chip
                    icon={<LentIcon />}
                    label="Lent"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {ticket.description}
              </Typography>

              {/* Tags */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {ticket.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" />
                ))}
              </Box>

              {/* History */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon />
                    <Typography variant="h6">History</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {ticket.history.map((entry) => (
                      <ListItem key={entry.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {users.find(u => u.id === entry.userId)?.name.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {entry.action}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(entry.timestamp, 'MMM d, yyyy h:mm a')}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              {entry.comment && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  "{entry.comment}"
                                </Typography>
                              )}
                              {entry.fromStatus && entry.toStatus && (
                                <Typography variant="caption" color="text.secondary">
                                  Moved from {entry.fromStatus} to {entry.toStatus}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {project?.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Assigned To
                  </Typography>
                  {assignedUser ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {assignedUser.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1">
                        {assignedUser.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {createdByUser?.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body1">
                      {createdByUser?.name}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {format(ticket.createdAt, 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>

                {ticket.dueDate && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {format(ticket.dueDate, 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Actions */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Actions
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={handleAssign}
                    fullWidth
                  >
                    Assign
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LentIcon />}
                    onClick={handleLend}
                    fullWidth
                  >
                    Lend
                  </Button>
                  
                  {ticket.type === 'lent' && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<SwapHoriz />}
                      fullWidth
                    >
                      Return
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onClose={() => setIsAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Assign to</InputLabel>
            <Select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              label="Assign to"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment (optional)"
            value={assignComment}
            onChange={(e) => setAssignComment(e.target.value)}
            placeholder="Add any guidance for the assignee..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained" disabled={!selectedAssignee}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lend Dialog */}
      <Dialog open={isLendDialogOpen} onClose={() => setIsLendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lend Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Lend to</InputLabel>
            <Select
              value={selectedLendTarget}
              onChange={(e) => setSelectedLendTarget(e.target.value)}
              label="Lend to"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} (Project)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment (required)"
            value={lendComment}
            onChange={(e) => setLendComment(e.target.value)}
            placeholder="Explain why you're lending this ticket..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLendSubmit} variant="contained" disabled={!selectedLendTarget || !lendComment.trim()}>
            Lend
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetail;
