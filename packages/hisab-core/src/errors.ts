export class HisabError extends Error {
  constructor(
    public code: 'INVALID_COORDINATES' | 'EPHEMERIS_UNAVAILABLE',
    message: string
  ) {
    super(message);
    this.name = 'HisabError';
  }
}
