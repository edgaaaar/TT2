import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import { MODULOS } from '../routes/modulos.js';

const ANCHO = 264;
const GRUPOS = ['General', 'Líneas de calidad', 'Sistema'];

function Menu({ onNavegar }) {
  return (
    <Box component="nav" aria-label="Navegación principal">
      <Toolbar>
        <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
          P.I.C.
        </Typography>
      </Toolbar>
      {GRUPOS.map((g) => (
        <List key={g} dense subheader={<ListSubheader disableSticky>{g}</ListSubheader>}>
          {MODULOS.filter((m) => m.grupo === g).map(({ ruta, titulo, icono: Icono, escalable }) => (
            <ListItemButton
              key={ruta}
              component={NavLink}
              to={ruta}
              onClick={onNavegar}
              sx={{ mx: 1, borderRadius: 2, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <Icono fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={titulo} />
              {escalable && (
                <Chip label="Escalable" size="small" variant="outlined" sx={{ color: 'inherit', borderColor: 'currentColor' }} />
              )}
            </ListItemButton>
          ))}
        </List>
      ))}
    </Box>
  );
}

export function MainLayout() {
  const escritorio = useMediaQuery((t) => t.breakpoints.up('md'));
  const [abierto, setAbierto] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          {!escritorio && (
            <IconButton edge="start" aria-label="Abrir menú" onClick={() => setAbierto(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h3" component="p" color="primary" noWrap>
            Plataforma Integrada de Calidad
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }} noWrap>
            Hospital Infantil de México Federico Gómez
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={escritorio ? 'permanent' : 'temporary'}
        open={escritorio || abierto}
        onClose={() => setAbierto(false)}
        sx={{ width: ANCHO, flexShrink: 0, '& .MuiDrawer-paper': { width: ANCHO, boxSizing: 'border-box' } }}
      >
        <Menu onNavegar={() => setAbierto(false)} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: 8, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
