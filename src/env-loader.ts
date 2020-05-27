import { ICerebroConfigEntry } from './interfaces'

/**
 * Generates an override list from process.env
 * @param {Array} yamlConfig YAML file data
 */
export function getOverridesFromEnv (
  yamlConfig: Array<ICerebroConfigEntry> = []
): Record<string, any> {
  return yamlConfig.reduce<Record<string, any>>((overrides, item) => {
    const envVariable = item.setting

    if (process.env[envVariable] !== undefined) {
      overrides[item.setting] = process.env[item.setting]

      try {
        // convert to array / object if defined that way
        overrides[item.setting] = JSON.parse(overrides[item.setting])
      } catch (e) {
        // ignore
      }
    }

    return overrides
  }, {})
}
