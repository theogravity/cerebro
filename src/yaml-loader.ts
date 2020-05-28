import yaml from 'js-yaml'
import { resolve } from 'path'

import { readFileSync } from 'fs'
import { Cerebro } from './index'
import { getOverridesFromEnv } from './env-loader'
import { DynamicConfigBuilder, ICerebroConfig } from './interfaces'

/**
 * Loads a YAML file and returns configuration for a given context.
 * @param {String} configFile Path to YAML file
 * @param {Object} [context] environment context
 * @returns {CerebroConfig}
 */
export function loadStaticConfig (
  configFile: string,
  context: Record<string, any> = {},
  overrides: Record<string, any> = {}
): ICerebroConfig {
  const filePath = resolve(process.cwd(), configFile)
  const config = yaml.safeLoad(readFileSync(filePath, 'utf8'))

  const cerebro = new Cerebro(config)

  return cerebro.resolveConfig(context, {
    overrides: {
      ...getOverridesFromEnv(config),
      ...overrides
    }
  })
}

/**
 * Loads a YAML file and returns a function that accepts a context and overrides
 * to generate configuration dynamically
 * @param {String} configFile Path to YAML file
 * @returns {Function}
 */
export function getDynamicConfigBuilder (
  configFile: string
): DynamicConfigBuilder {
  const filePath = resolve(process.cwd(), configFile)
  const config = yaml.safeLoad(readFileSync(filePath, 'utf8'))
  const cerebro = new Cerebro(config)

  return (context, overrides = {}) => {
    return cerebro.resolveConfig(context, {
      overrides
    })
  }
}
