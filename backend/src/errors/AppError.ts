export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class HoldError extends AppError {
  constructor(message: string, statusCode = 409) {
    super(message, statusCode);
  }
}

export class BookingError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}

export class TherapistError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode);
  }
}
