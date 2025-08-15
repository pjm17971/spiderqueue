import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, TextField, Stack, Divider, Alert } from '@mui/material';
import { Google } from '@mui/icons-material';
import { isFirebaseEnabled, signInWithGooglePopup, subscribeAuthState } from '../lib/firebase';

interface AuthGateProps {
  onAuthed: (email: string) => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onAuthed }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const unsub = subscribeAuthState((user) => {
      if (user?.email) onAuthed(user.email);
    });
    return () => unsub();
  }, [onAuthed]);

  async function handleGoogle() {
    try {
      const user = await signInWithGooglePopup();
      if (user.email) onAuthed(user.email);
    } catch (e) {
      setError('Google sign-in failed');
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ p: 4, width: 420, maxWidth: '100%' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Sign in to SpiderQueue</Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <Stack spacing={2}>
          {isFirebaseEnabled() ? (
            <Button onClick={handleGoogle} startIcon={<Google />} variant="contained">Continue with Google</Button>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">Google sign-in is not configured. Enter your email to continue (local mode).</Typography>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <Button onClick={() => email && onAuthed(email)} variant="contained" disabled={!email}>Continue</Button>
            </>
          )}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">You can add real email delivery later; invite codes are supported now.</Typography>
      </Paper>
    </Box>
  );
};

export default AuthGate;
