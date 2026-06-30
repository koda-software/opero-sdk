import {Args} from '@oclif/core'

import {BaseCommand} from '../../base-command.js'
import {writeConfig} from '../../config/write.js'

export default class CompaniesSelect extends BaseCommand {
  static args = {
    companyId: Args.string({
      description: 'Company ID to use by default for company-scoped runtime endpoints.',
      required: true,
    }),
  }

  static description = 'Select the default company for company-scoped runtime endpoints.'
  static enableJsonFlag = true

  async run(): Promise<{data: {companyId: string; configPath: string; selected: boolean}}> {
    const {args, flags} = await this.parse(CompaniesSelect)
    const {config} = await this.loadSettings(flags)
    await writeConfig(this.configPath, {
      ...config,
      companyId: args.companyId,
    })

    const result = {
      data: {
        companyId: args.companyId,
        configPath: this.configPath,
        selected: true,
      },
    }

    if (!this.jsonEnabled()) this.log(`Selected company ${args.companyId}`)
    return result
  }
}
