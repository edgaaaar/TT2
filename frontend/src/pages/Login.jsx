import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api, mensajeDeError } from '../api/client.js';

// CU-07. La lógica de sesión se conecta cuando exista el módulo auth del backend (Sprint A).
export function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await api.post('/auth/login', { correo, password });
      window.location.assign('/tablero');
    } catch (err) {
      setError(err?.response?.status === 401 ? 'Usuario o contraseña incorrectos' : mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper component="form" onSubmit={enviar} noValidate sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h1" color="primary" gutterBottom>
          Iniciar sesión
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Plataforma Integrada de Calidad, HIMFG
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Correo institucional"
            type="email"
            autoComplete="username"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={enviando || !correo || !password}>
            {enviando ? 'Verificando...' : 'Entrar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
