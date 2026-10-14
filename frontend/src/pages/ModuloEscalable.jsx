import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

// Punto de extensión de MECIC e INDICAS II (DEC-15). No implementa funcionalidad en TT2.
export function ModuloEscalable({ titulo, descripcion }) {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        {titulo}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {descripcion}
      </Typography>
      <Alert severity="info" variant="outlined">
        Módulo escalable, no habilitado. Su arquitectura y modelo de datos están contemplados para
        incorporarse sin cambios estructurales al sistema.
      </Alert>
    </>
  );
}
