import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  Stack
} from '@mui/material';
import { Project, User, CreateTicketData } from '../types';

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  users: User[];
  onCreate: (data: CreateTicketData) => Promise<void> | void;
}

const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  open,
  onClose,
  project,
  users,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !project) return;

    const ticketData: CreateTicketData = {
      title: title.trim(),
      description: description.trim(),
      tags,
      projectId: project.id,
      assignedTo: assignedTo || undefined,
      priority,
      comment: comment.trim() || undefined
    };

    try {
      setSubmitting(true);
      await onCreate(ticketData);
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setTags([]);
      setNewTag('');
      setComment('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssignedTo('');
    setTags([]);
    setNewTag('');
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Ticket</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder="Enter ticket title..."
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Describe the task or issue..."
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assign to</InputLabel>
              <Select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                label="Assign to"
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <TextField
              placeholder="Add tags (press Enter)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleAddTag}
              fullWidth
              size="small"
            />
            {tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Stack>
            )}
          </Box>

          <TextField
            label="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Add any additional context or guidance..."
          />

          {project && (
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Creating ticket for project: <strong>{project.name}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!title.trim() || !project || submitting}
        >
          {submitting ? 'Creating…' : 'Create Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicketDialog;

