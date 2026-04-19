export const toStr = (v: string | string[]): string =>
  typeof v === 'string' ? v : (v[0] ?? '')
