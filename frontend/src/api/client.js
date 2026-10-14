import axios from 'axios';

// Cliente HTTP único. La sesión viaja en cookie httpOnly (RNF-003); el token CSRF se
// toma de la cookie legible pic_csrf y se envía en X-CSRF-Token (DEC-06).
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15000,
});

const leerCookie = (nombre) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${nombre}=`))
    ?.split('=')[1];

api.interceptors.request.use((config) => {
  if (!['get', 'head', 'options'].includes((config.method ?? 'get').toLowerCase())) {
    const csrf = leerCookie('pic_csrf');
    if (csrf) config.headers['X-CSRF-Token'] = decodeURIComponent(csrf);
  }
  return config;
});

export const mensajeDeError = (err) =>
  err?.response?.data?.error?.mensaje ?? 'No fue posible comunicarse con el servidor';
