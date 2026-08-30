export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, status: number) {
    super(message);
    this.statusCode = status;
    // Maintains proper stack trace in V8 engines
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
