import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// Paleta institucional tomada del prototipo aprobado en TT1 (style.css).
export const theme = createTheme(
  {
    palette: {
      primary: { main: '#003D79', contrastText: '#FFFFFF' },
      secondary: { main: '#009640', contrastText: '#FFFFFF' },
      background: { default: '#F8FAFC', paper: '#FFFFFF' },
      text: { primary: '#1A1A1A', secondary: '#475569' },
      divider: '#E2E8F0',
      error: { main: '#DC2626' },
      warning: { main: '#D97706' },
    },
    typography: {
      fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '1.75rem', fontWeight: 700 },
      h2: { fontSize: '1.375rem', fontWeight: 700 },
      h3: { fontSize: '1.125rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiPaper: { styleOverrides: { root: { boxShadow: '0 4px 20px 0 rgba(0, 61, 121, 0.08)' } } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTextField: { defaultProps: { fullWidth: true, size: 'small' } },
    },
  },
  esES,
);
