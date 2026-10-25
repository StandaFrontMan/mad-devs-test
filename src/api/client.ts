import type { Booking, ApiErrorResponse } from '@/domain/booking';

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public conflictingBookings?: Booking[];

  constructor(status: number, message: string, code?: string, conflictingBookings?: Booking[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.conflictingBookings = conflictingBookings;
  }
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorBody = data as ApiErrorResponse | null;
    const message =
      errorBody?.message || response.statusText || `Request failed with status ${response.status}`;
    const code = errorBody?.code;
    const conflictingBookings = errorBody?.conflictingBookings;

    throw new ApiError(response.status, message, code, conflictingBookings);
  }

  return data as T;
}
