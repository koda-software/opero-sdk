export function apiPath(template: string, values: Record<string, string>): string {
  return template.replaceAll(/\{([^}]+)\}/g, (_, key: string) => {
    const value = values[key]
    if (value === undefined) {
      throw new Error(`Missing path value for ${key}`)
    }

    return encodeURIComponent(value)
  })
}
