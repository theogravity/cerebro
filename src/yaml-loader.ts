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
export function loadStaticConfig<Flags extends Record<string, any> = Record<string, any>> (
  configFile: string,
  context: Record<string, any> = {},
  overrides: Record<string, any> = {}
): ICerebroConfig<Flags> {
  const filePath = resolve(process.cwd(), configFile)
  const config = yaml.safeLoad(readFileSync(filePath, 'utf8'))

  const cerebro = new Cerebro<Flags>(config)

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
export function getDynamicConfigBuilder<Flags extends Record<string, any> = Record<string, any>> (
  configFile: string
): DynamicConfigBuilder<Flags> {
  const filePath = resolve(process.cwd(), configFile)
  const config = yaml.safeLoad(readFileSync(filePath, 'utf8'))
  const cerebro = new Cerebro<Flags>(config)

  return (context, overrides = {}) => {
    return cerebro.resolveConfig(context, {
      overrides
    })
  }
}

/**
 * Given the path to a YAML file, returns a Cerebro instance
 * @param {String} configFile Path to YAML file
 * @return {Cerebro}
 */
export function loadConfigParser<Flags extends Record<string, any> = Record<string, any>> (
  configFile: string,
): Cerebro<Flags> {
  const filePath = resolve(process.cwd(), configFile)
  const config = yaml.safeLoad(readFileSync(filePath, 'utf8'))

  return new Cerebro<Flags>(config)
}
