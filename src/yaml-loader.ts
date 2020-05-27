import yaml from 'js-yaml'
import { readFileSync } from 'fs'
import { Cerebro } from './index'

export function loadConfigWithoutContext (configFile: string) {
  const config = yaml.safeLoad(readFileSync(configFile, 'utf8'))
  return new Cerebro(config)
}

export function loadConfig (
  configFile: string,
  context: Record<string, any> = {}
): Record<string, any> {
  const cerebro = loadConfigWithoutContext(configFile)
  return cerebro.resolveConfig(context)
}
