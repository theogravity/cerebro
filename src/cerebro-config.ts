import type { ICerebroConfig, ICerebroConfigParams } from './interfaces'

/**
 * Wrapper for resolvedConfig that provides convenience methods for checking value types and dehydration
 * @constructor
 * @param {Object} resolvedConfig - object created by building context with settings config
 */
export class CerebroConfig<Flags extends Record<string, any> = Record<string, any>> implements ICerebroConfig<Flags> {
  private _resolved: Flags
  private _labels: Record<string, string[]>
  private _labelResolved: Record<string, any>

  constructor (resolvedConfig: ICerebroConfigParams) {
    if (!resolvedConfig.answers) {
      throw new Error('`resolvedConfig` is required')
    }

    this._labelResolved = resolvedConfig.labelResolved || {}
    this._resolved = resolvedConfig.answers as Flags
    this._labels = resolvedConfig.labels || {}
  }

  /**
   * Gets the requested value if it is a Boolean.  Returns null if the value does not exist.
   * Throws an error if the requested value is not a Boolean.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {Boolean|null} The value of the setting
   */
  isEnabled<K extends keyof Flags>(name: K): boolean {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined') {
      return null
    }

    if (typeof setting !== 'boolean') {
      throw new Error(
        'The requested setting (' +
          String(name) +
          ') from isEnabled is not a boolean. ' +
          'It is a ' +
          typeof setting +
          '.  Please use #getValue instead.'
      )
    }

    return setting
  }

  /**
   * Gets the requested value if it is not a Boolean.  Returns null if the value does not exist.
   * Throws an error if the requested value is a Boolean.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {!Boolean|*} The value of the setting
   */
  getValue<K extends keyof Flags>(name: K): Flags[K] | null {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined') {
      return null
    }

    if (typeof setting === 'boolean') {
      throw new Error(
        'The requested setting (' +
          String(name) +
          ') from isEnabled is a boolean.  ' +
          'Please use #isEnabled instead.'
      )
    }

    // did not include other types for backwards-compat

    return setting
  }

  /**
   * Gets the requested value if it is not a Boolean.
   * Throws an error if the requested value is a Boolean / empty / null / undefined.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {!Boolean|*} The value of the setting
   */
  getAssertValue<K extends keyof Flags>(name: K): Flags[K] {
    const setting = this._resolved[name]

    if (setting === '' || setting === null || typeof setting === 'undefined') {
      throw new Error(
        'The requested setting (' +
          String(name) +
          ') from getAssertValue is an empty string, null, or undefined.'
      )
    }

    if (typeof setting === 'boolean') {
      throw new Error(
        'The requested setting (' +
          String(name) +
          ') from isEnabled is a boolean.  ' +
          'Please use #isEnabled instead.'
      )
    }

    return setting
  }

  /**
   * Gets the requested value in its raw form. No checks are performed on it.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {*} The value of the setting
   */
  getRawValue<K extends keyof Flags>(name: K): Flags[K] {
    return this._resolved[name]
  }

  /**
   * Serializes the object to send to the client.
   * Intended to be used on the server.
   * The output of this function must be rehydrated on the client.
   *
   * @return {JSON} Map of settings to values.
   */
  dehydrate (): string {
    const { _resolved, _labels, _labelResolved } = this
    const dehydratedObject = { _resolved, _labels, _labelResolved }

    return JSON.stringify(dehydratedObject)
  }

  /**
   * Returns the resolved configuration as an object.
   * NOTE: This does not deep clone the object, which means that clients could abuse this
   * by changing values.  Doing a deep clone will obviously impact performance.
   *
   * @return {Object} The resolved config.
   */
  getRawConfig (): Flags {
    return this._resolved
  }

  /**
   * Gets configuration that was categorized under a specific label.
   *
   * Returns null if the label does not exist.
   */
  getConfigForLabel (label: string): Record<string, any> {
    return this._labelResolved[label] || null
  }

  /**
   * Gets a value from configuration that was categorized under a specific label.
   *
   * Returns null if the label or key does not exist.
   */
  getConfigValueForLabel(label: string, key: string) {
    const labels = this.getConfigForLabel(label)
    return labels ? labels[key] ?? null : null
  }

  /**
   * Returns an object in the form of `{ <setting_name>: <array of labels> }`.
   *
   * For settings without labels, an empty array is assigned instead.
   */
  getLabels (): Record<string, string[]> {
    return this._labels
  }
}
