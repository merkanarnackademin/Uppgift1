// Standardized API error response helpers per spec.md
// Shape: { error: { code: string, message: string, details?: any } }

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: any;
  };
};

export function jsonError(input: { code: string; message: string; details?: any }): ApiError {
  const { code, message, details } = input;
  const payload: ApiError = { error: { code, message } };
  if (typeof details !== 'undefined') payload.error.details = details;
  return payload;
}
