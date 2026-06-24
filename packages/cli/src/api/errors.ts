import {redactText} from './redaction.js'

export type CliErrorCode =
  | 'API_ERROR'
  | 'CONFIG_ERROR'
  | 'FILE_ERROR'
  | 'INVALID_JSON'
  | 'MISSING_AUTH'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'USAGE_ERROR'
  | string

export type CliErrorJson = {
  error: {
    code: CliErrorCode
    details?: unknown
    message: string
    status?: number
  }
}

export class OperoCliError extends Error {
  readonly code: CliErrorCode
  readonly details?: unknown
  readonly exitCode: number
  readonly status?: number

  constructor(args: {code: CliErrorCode; details?: unknown; exitCode?: number; message: string; status?: number}) {
    super(redactText(args.message))
    this.name = 'OperoCliError'
    this.code = args.code
    this.details = args.details
    this.exitCode = args.exitCode ?? 1
    this.status = args.status
  }

  toJson(): CliErrorJson {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.status ? {status: this.status} : {}),
        ...(this.details === undefined ? {} : {details: this.details}),
      },
    }
  }
}

export class ApiError extends OperoCliError {
  constructor(args: {code: string; details?: unknown; message: string; status: number}) {
    super({
      code: args.code || 'API_ERROR',
      details: args.details,
      exitCode: 5,
      message: args.message,
      status: args.status,
    })
    this.name = 'ApiError'
  }
}
