import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Box, Typography, Stack } from '@mui/material';
import { getWorkspacesRepo } from '../lib/repos/workspacesRepo';

interface Props {
  open: boolean;
  onClose: () => void;
  onAccepted: (workspaceId: string) => void;
  currentEmail: string;
}

const CODE_LENGTH = 6;

const AcceptInviteDialog: React.FC<Props> = ({ open, onClose, onAccepted, currentEmail }) => {
  const repo = getWorkspacesRepo();
  const [codeChars, setCodeChars] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const codeValue = useMemo(() => codeChars.join('').toUpperCase(), [codeChars]);

  useEffect(() => {
    if (open) {
      setCodeChars(Array(CODE_LENGTH).fill(''));
      setError(undefined);
      setSubmitting(false);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }, [open]);

  function sanitizeChar(ch: string) {
    const c = ch.toUpperCase();
    return /[A-Z0-9]/.test(c) ? c : '';
  }

  async function handleAccept(overrideCode?: string) {
    setError(undefined);
    const submitCode = (overrideCode || codeValue).toUpperCase();
    if (submitCode.length !== CODE_LENGTH || submitting) return;
    try {
      setSubmitting(true);
      const res = await repo.acceptInvite(currentEmail, submitCode);
      if (!res.success || !res.workspaceId) {
        setError(res.message || 'Invalid invite');
        setSubmitting(false);
        return;
      }
      onAccepted(res.workspaceId);
      onClose();
    } catch (e) {
      setError('Failed to accept invite');
      setSubmitting(false);
    }
  }

  function handleChange(index: number, value: string) {
    const v = sanitizeChar(value.slice(-1));
    const next = [...codeChars];
    next[index] = v;
    setCodeChars(next);
    const joined = next.join('');
    if (v && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (v && index === CODE_LENGTH - 1 && joined.length === CODE_LENGTH) {
      // auto-submit when last box filled
      void handleAccept(joined);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (codeChars[index]) {
        const next = [...codeChars];
        next[index] = '';
        setCodeChars(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    if (!text) return;
    const arr = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < text.length; i += 1) arr[i] = text[i];
    setCodeChars(arr);
    const nextIndex = Math.min(text.length, CODE_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
    if (text.length === CODE_LENGTH) {
      // auto-submit on full paste
      void handleAccept(text);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Join Workspace</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Signed in as</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{currentEmail}</Typography>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Enter invite code</Typography>
        <Stack direction="row" spacing={1} justifyContent="space-between" onPaste={handlePaste}>
          {codeChars.map((ch, idx) => (
            <TextField
              key={idx}
              value={ch}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              inputRef={(el) => (inputsRef.current[idx] = el)}
              inputProps={{
                maxLength: 1,
                style: { textAlign: 'center', fontSize: 18, padding: '10px 0', width: 42 },
                inputMode: 'text',
                pattern: '[A-Za-z0-9]'
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, width: 48 }}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => handleAccept()} variant="contained" disabled={codeValue.length !== CODE_LENGTH || submitting}>
          {submitting ? 'Joining…' : 'Join'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcceptInviteDialog;
