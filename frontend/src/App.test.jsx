import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme.js';
import { App } from './App.jsx';

const renderEn = (ruta) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('Navegación base', () => {
  it('muestra las tres líneas de calidad implementadas y las dos escalables', () => {
    renderEn('/tablero');
    for (const m of ['SREA', 'SUG', 'SESTAD', 'MECIC', 'INDICAS II']) {
      expect(screen.getAllByText(m).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText('Escalable')).toHaveLength(2);
  });

  it('MECIC se presenta como módulo escalable no habilitado (DEC-15)', () => {
    renderEn('/mecic');
    expect(screen.getByText(/Módulo escalable, no habilitado/)).toBeInTheDocument();
  });

  it('el formulario de inicio de sesión deshabilita el envío sin credenciales', () => {
    renderEn('/login');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });
});
