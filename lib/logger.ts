// Structured logging service with correlation ID support

export class Logger {
  private correlationId: string;

  constructor(correlationId: string) {
    this.correlationId = correlationId;
  }

  info(message: string, data?: any) {
    console.log(JSON.stringify({
      level: 'info',
      correlationId: this.correlationId,
      message,
      data,
      timestamp: new Date().toISOString()
    }));
  }

  error(message: string, error?: any) {
    console.error(JSON.stringify({
      level: 'error',
      correlationId: this.correlationId,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    }));
  }

  warn(message: string, data?: any) {
    console.warn(JSON.stringify({
      level: 'warn',
      correlationId: this.correlationId,
      message,
      data,
      timestamp: new Date().toISOString()
    }));
  }
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
