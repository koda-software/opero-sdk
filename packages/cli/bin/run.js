#!/usr/bin/env node
import {execute} from '@oclif/core'

normalizeLeadingOutputFlags()
await execute({development: false, dir: import.meta.url})

function normalizeLeadingOutputFlags() {
  const outputFlags = new Set(['--json', '--table'])
  while (outputFlags.has(process.argv[2])) {
    const [flag] = process.argv.splice(2, 1)
    process.argv.push(flag)
  }
}
