export class AgentServiceError extends Error {
  public status?: number;
  public details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "AgentServiceError";
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, AgentServiceError.prototype);
  }
}

export class TimeoutError extends AgentServiceError {
  constructor(message = "The request to the agent service timed out.") {
    super(message, 408);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ValidationError extends AgentServiceError {
  constructor(message: string, details?: unknown) {
    super(message, 422, details);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NetworkError extends AgentServiceError {
  constructor(message = "Failed to communicate with the agent service.") {
    super(message, 503);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
