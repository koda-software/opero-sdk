import {rawRequestArgs, rawRequestFlags, RawRequestCommand} from '../../request-command.js'

export default class RequestPatch extends RawRequestCommand {
  static args = rawRequestArgs
  static description = 'Run an authenticated PATCH request against the Opero API.'
  static enableJsonFlag = true
  static flags = rawRequestFlags

  async run(): Promise<unknown> {
    return this.runRawRequest(RequestPatch, 'PATCH')
  }
}
