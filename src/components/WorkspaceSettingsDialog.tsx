import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, List, ListItem, ListItemText, Divider, Stack, Alert, Tooltip, IconButton } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import type { StoredWorkspace, WorkspaceMember } from '../lib/store';
import { getWorkspacesRepo } from '../lib/repos/workspacesRepo';

interface Props {
  open: boolean;
  onClose: () => void;
  workspace: StoredWorkspace;
}

const WorkspaceSettingsDialog: React.FC<Props> = ({ open, onClose, workspace }) => {
  const repo = getWorkspacesRepo();
  const [name, setName] = useState(workspace.name);
  const [inviteEmail, setInviteEmail] = useState('');
  const [lastInviteCode, setLastInviteCode] = useState<string | undefined>();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setName(workspace.name);
  }, [workspace.id, workspace.name]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await repo.listMembers(workspace.id);
        if (active) setMembers(list);
      } catch (e) {
        setError('Failed to load members');
      }
    })();
    return () => { active = false; };
  }, [open, workspace.id]);

  async function handleSave() {
    try {
      if (name.trim() && name.trim() !== workspace.name) {
        await repo.renameWorkspace(workspace.id, name.trim());
      }
      onClose();
    } catch (e) {
      setError('Failed to save');
    }
  }

  async function handleInvite() {
    setError(undefined);
    try {
      if (!inviteEmail.trim()) return;
      const res = await repo.inviteUser(workspace.id, inviteEmail.trim());
      setLastInviteCode(res.code);
      setInviteEmail('');
    } catch (e) {
      setError('Failed to create invite');
    }
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Workspace Settings</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Workspace Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Users</Typography>
            <List dense>
              {members.map((m) => (
                <ListItem key={m.email}>
                  <ListItemText primary={m.email} secondary={m.role} />
                </ListItem>
              ))}
              {members.length === 0 && (
                <Typography variant="body2" color="text.secondary">No users yet.</Typography>
              )}
            </List>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Invite User</Typography>
            <Stack direction="row" spacing={1}>
              <TextField label="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} fullWidth />
              <Button onClick={handleInvite} variant="contained" disabled={!inviteEmail.trim()}>Invite</Button>
            </Stack>
            {lastInviteCode && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Invite code: <strong>{lastInviteCode}</strong>
                <Tooltip title="Copy code">
                  <IconButton size="small" onClick={() => copyToClipboard(lastInviteCode)} sx={{ ml: 1 }}>
                    <ContentCopy fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkspaceSettingsDialog;
