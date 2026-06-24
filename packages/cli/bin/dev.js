#!/usr/bin/env node
import {execute} from '@oclif/core'

normalizeLeadingJsonFlag()
await execute({development: true, dir: import.meta.url})

function normalizeLeadingJsonFlag() {
  const index = process.argv.indexOf('--json', 2)
  if (index === 2) {
    process.argv.splice(index, 1)
    process.argv.push('--json')
  }
}
