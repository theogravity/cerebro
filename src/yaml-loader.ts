import yaml from 'js-yaml'
import { readFileSync } from 'fs'
import { Cerebro } from './index'
import { getOverridesFromEnv } from './env-loader'
import { ICerebroConfig } from './interfaces'

/**
 * @param {String} configFile Path to YAML file
 * @param {Object} [context] environment context
 */
export function loadConfig (
  configFile: string,
  context: Record<string, any> = {}
): ICerebroConfig {
  const config = yaml.safeLoad(readFileSync(configFile, 'utf8'))

  const cerebro = new Cerebro(config)

  return cerebro.resolveConfig(context, {
    overrides: getOverridesFromEnv(config)
  })
}
