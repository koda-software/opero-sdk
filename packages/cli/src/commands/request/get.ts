import {rawRequestArgs, rawRequestFlags, RawRequestCommand} from '../../request-command.js'

export default class RequestGet extends RawRequestCommand {
  static args = rawRequestArgs
  static description = 'Run an authenticated GET request against the Opero API.'
  static enableJsonFlag = true
  static flags = {
    header: rawRequestFlags.header,
    query: rawRequestFlags.query,
  }

  async run(): Promise<unknown> {
    return this.runRawRequest(RequestGet, 'GET')
  }
}
