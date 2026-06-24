export function isSourceCheckout(): boolean {
  const argvPath = process.argv[1] ?? ''
  return argvPath.includes('/packages/cli/bin/') || argvPath.includes('\\packages\\cli\\bin\\')
}
