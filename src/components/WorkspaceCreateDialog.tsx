import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Alert } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void> | void;
}

const WorkspaceCreateDialog: React.FC<Props> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setError(undefined);
      setSubmitting(false);
    }
  }, [open]);

  async function handleCreate() {
    if (!name.trim() || submitting) return;
    try {
      setSubmitting(true);
      await onCreate(name.trim());
      onClose();
    } catch (e) {
      setError('Failed to create workspace');
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Workspace</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            autoFocus
            label="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            placeholder="Enter a name for your workspace"
          />
          <Typography variant="body2" color="text.secondary">
            You can add invites and permissions later from workspace settings.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!name.trim() || submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkspaceCreateDialog;
