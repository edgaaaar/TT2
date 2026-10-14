import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import FolderSharedOutlined from '@mui/icons-material/FolderSharedOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';

// Navegación principal. "escalable" marca los módulos diseñados pero no implementados en TT2 (DEC-15).
export const MODULOS = [
  { ruta: '/tablero', titulo: 'Tablero', icono: DashboardOutlined, grupo: 'General', sprint: 'E' },
  {
    ruta: '/srea',
    titulo: 'SREA',
    descripcion: 'Notificación de Incidentes Relacionados con la Seguridad del Paciente',
    icono: ReportProblemOutlined,
    grupo: 'Líneas de calidad',
    sprint: 'B y C',
  },
  {
    ruta: '/sug',
    titulo: 'SUG',
    descripcion: 'Atención de Quejas, Sugerencias y Felicitaciones',
    icono: ForumOutlined,
    grupo: 'Líneas de calidad',
    sprint: 'D',
  },
  {
    ruta: '/sestad',
    titulo: 'SESTAD',
    descripcion: 'Encuesta de Satisfacción, Trato Adecuado y Digno',
    icono: FactCheckOutlined,
    grupo: 'Líneas de calidad',
    sprint: 'E',
  },
  {
    ruta: '/mecic',
    titulo: 'MECIC',
    descripcion: 'Modelo de Evaluación del Expediente Clínico',
    icono: FolderSharedOutlined,
    grupo: 'Líneas de calidad',
    escalable: true,
  },
  {
    ruta: '/indicas',
    titulo: 'INDICAS II',
    descripcion: 'Sistema Nacional de Indicadores de Calidad en Salud',
    icono: InsightsOutlined,
    grupo: 'Líneas de calidad',
    escalable: true,
  },
  { ruta: '/reportes', titulo: 'Reportes', icono: AssessmentOutlined, grupo: 'General', sprint: 'E' },
  { ruta: '/admin', titulo: 'Administración', icono: AdminPanelSettingsOutlined, grupo: 'Sistema', sprint: 'A y B' },
];
