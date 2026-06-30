import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {OperoCliError} from '../../api/errors.js'
import {promptConfirm} from '../../cli/prompts.js'
import {WriteCommand} from '../../write-command.js'
import {COMPANY_REQUEST_OPTIONS} from '../../companies/shared.js'

export default class CompaniesDelete extends WriteCommand {
  static args = {
    companyId: Args.string({
      description: 'Company ID.',
      required: true,
    }),
  }

  static description = 'Delete a company from the token organization.'
  static enableJsonFlag = true
  static flags = {
    yes: Flags.boolean({
      char: 'y',
      description: 'Skip confirmation prompt.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CompaniesDelete)
    if (!flags.yes && !(await promptConfirm(`Delete company ${args.companyId}?`))) {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: 'Delete cancelled',
      })
    }

    return this.deleteJson(apiPath('/v1/companies/{companyId}', args), flags, undefined, COMPANY_REQUEST_OPTIONS)
  }
}
