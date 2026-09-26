export class AppError extends Error {
  constructor(readonly status: 400 | 401 | 403 | 404 | 409 | 503, message: string) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") { super(404, message); }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(409, message); }
}
