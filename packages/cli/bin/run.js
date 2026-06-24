#!/usr/bin/env node
import {execute} from '@oclif/core'
import {readFileSync} from 'node:fs'
import pc from 'picocolors'

function normalizeLeadingOutputFlags() {
  const outputFlags = new Set(['--json', '--table'])
  while (process.argv.length > 3 && outputFlags.has(process.argv[2])) {
    const [flag] = process.argv.splice(2, 1)
    process.argv.push(flag)
  }
}

function printStartScreen() {
  const version = readVersion()
  const lines = [
    ...renderLogo(),
    '',
    `${pc.bold('Opero CLI')} ${pc.dim(`v${version}`)}`,
    pc.dim('Command-line access to the Opero API.'),
    '',
    pc.bold('Start Here'),
    startCommand('opero help', 'Show all topics and commands'),
    startCommand('opero init', 'Configure base URL and API token'),
    startCommand('opero --json doctor', 'Verify config, auth, and API reachability'),
    startCommand('opero --table contractors list', 'Scan data in a readable table'),
    '',
  ]

  process.stdout.write(`${lines.join('\n')}\n`)
}

function startCommand(command, description) {
  return `  ${pc.cyan(command.padEnd(33))} ${pc.dim(description)}`
}

function readVersion() {
  try {
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    return packageJson.version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

function renderLogo() {
  return LOGO.map((line) => `${operoBlue(line.slice(0, LOGO_SPLIT))}${pc.white(line.slice(LOGO_SPLIT))}`)
}

function operoBlue(value) {
  if (!pc.isColorSupported) return value
  return `\u001B[38;2;0;137;255m${value}\u001B[39m`
}

const LOGO_SPLIT = 23
const LOGO = [
  '           @@@@@@@',
  '        @@@@@@ @@@@@@',
  '      @@@@@       @@@@@   @@@@@@@    @@@@@@@    @@@@ @@@@@@@',
  '      @@             @@ @@@@   @@@@ @@@    @@@ @@   @@@    @@@',
  '      @@             @@ @@       @@@@@@@@@@@@@ @@  @@       @@',
  '      @@             @@ @@       @@ @@      @@ @@  @@@      @@',
  '      @@             @@ @@@@@@@@@@  @@@@@@@@@  @@   @@@@@@@@@',
  '      @@@@@       @@@@@ @@ @@@@@      @@@@@    @@     @@@@@',
  '        @@@@@@@@@@@@@   @@',
  '            @@@@@',
]

normalizeLeadingOutputFlags()
if (process.argv.length === 2) {
  printStartScreen()
  process.exit(0)
}

await execute({development: false, dir: import.meta.url})
