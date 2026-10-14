// Error de dominio con código HTTP y código estable para el frontend.
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, 'SOLICITUD_INVALIDA', message, details);
  }

  static unauthorized(message = 'No autenticado') {
    return new AppError(401, 'NO_AUTENTICADO', message);
  }

  static forbidden(message = 'Sin permiso para esta operación') {
    return new AppError(403, 'SIN_PERMISO', message);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new AppError(404, 'NO_ENCONTRADO', message);
  }

  static conflict(message, details) {
    return new AppError(409, 'CONFLICTO', message, details);
  }
}
