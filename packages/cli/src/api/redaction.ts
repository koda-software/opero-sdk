export function redactToken(token: string | undefined): string | undefined {
  if (!token) return undefined
  if (token.length <= 8) return '********'
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

export function redactText(value: string): string {
  return value.replaceAll(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer [REDACTED]').replaceAll(/ek_[A-Za-z0-9]+/g, 'ek_[REDACTED]')
}
