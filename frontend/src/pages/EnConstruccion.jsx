import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export function EnConstruccion({ titulo, descripcion, sprint }) {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        {titulo}
      </Typography>
      {descripcion && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {descripcion}
        </Typography>
      )}
      <Paper sx={{ p: 3 }}>
        <Typography>Módulo en desarrollo{sprint ? `, programado para el Sprint ${sprint}` : ''}.</Typography>
      </Paper>
    </>
  );
}
