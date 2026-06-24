import {ReadCommand} from '../../read-command.js'

export default class CurrenciesList extends ReadCommand {
  static description = 'List supported currencies.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CurrenciesList)
    return this.getJson('/v1/currencies', flags)
  }
}
