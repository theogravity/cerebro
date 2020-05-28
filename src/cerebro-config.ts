import { ICerebroConfig } from './interfaces'

/**
 * Wrapper for resolvedConfig that provides convenience methods for checking value types and dehydration
 * @constructor
 * @param {Object} resolvedConfig - object created by building context with settings config
 */
export class CerebroConfig implements ICerebroConfig {
  _resolved: any
  _labels: any

  constructor (resolvedConfig) {
    if (!resolvedConfig.answers) {
      throw new Error('`resolvedConfig` is required')
    }

    this._resolved = resolvedConfig.answers
    this._labels = resolvedConfig.labels
  }

  /**
   * Gets the requested value if it is a Boolean.  Returns null if the value does not exist.
   * Throws an error if the requested value is not a Boolean.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {Boolean|null} The value of the setting
   */
  isEnabled (name: string): boolean {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined') {
      return null
    }

    if (typeof setting !== 'boolean') {
      throw new Error(
        'The requested setting (' +
          name +
          ') from isEnabled is not a boolean. ' +
          'It is a ' +
          typeof setting +
          '.  Please use #getValue instead.'
      )
    }

    return setting
  }

  /**
   * Gets the requested value as an object. Returns null if the value does not exist or is not an object.
   * @param {String} name The name of the setting that you want to value of
   * @return {Object|null} The value of the setting
   */
  getObject<T = any> (name: string): Record<string, T> {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined' || typeof setting !== 'object') {
      return null
    }

    return setting
  }

  /**
   * Gets the requested value as a float. Returns null if the value does not exist or is not a number.
   * @param {String} name The name of the setting that you want to value of
   * @return {Number|null} The value of the setting
   */
  getFloat (name: string): number {
    const setting = this._resolved[name]
    const value = parseFloat(setting)

    if (typeof setting === 'undefined' || isNaN(value)) {
      return null
    }

    return value
  }

  /**
   * Gets the requested value as an integer. Returns null if the value does not exist or is not a number.
   * @param {String} name The name of the setting that you want to value of
   * @return {Number|null} The value of the setting
   */
  getInt (name: string): number {
    const setting = this._resolved[name]
    const value = parseInt(setting, 10)

    if (typeof setting === 'undefined' || isNaN(value)) {
      return null
    }

    return value
  }

  /**
   * Gets the requested value as an array. Returns null if the value does not exist or is not an array.
   * @param {String} name The name of the setting that you want to value of
   * @return {Array|null}
   */
  getArray<T = any> (name: string): Array<T> {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined' || !Array.isArray(setting)) {
      return null
    }

    return setting
  }

  /**
   * Gets the requested value as a string. Returns null if the value does not exist or is not a string.
   * @param {String} name The name of the setting that you want to value of
   * @return {String|null}
   */
  getString (name: string): string {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined' || typeof setting !== 'string') {
      return null
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
  getValue<T = any> (name: string): T {
    const setting = this._resolved[name]

    if (typeof setting === 'undefined') {
      return null
    }

    if (typeof setting === 'boolean') {
      throw new Error(
        'The requested setting (' +
          name +
          ') from isEnabled is a boolean.  ' +
          'Please use #isEnabled instead.'
      )
    }

    // did not include other types for backwards-compat

    return setting
  }

  /**
   * Gets the requested value in its raw form. No checks are performed on it.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {*} The value of the setting
   */
  getRawValue<T = any> (name: string): T {
    const setting = this._resolved[name]
    return setting
  }

  /**
   * Serializes the object to send to the client.
   * Intended to be used on the server.
   * The output of this function must be rehydrated on the client.
   *
   * @return {JSON} Map of settings to values.
   */
  dehydrate (): string {
    const { _resolved, _labels } = this
    const dehydratedObject = { _resolved, _labels }

    return JSON.stringify(dehydratedObject)
  }

  /**
   * Returns the resolved configuration as an object.
   * NOTE: This does not deep clone the object, which means that clients could abuse this
   * by changing values.  Doing a deep clone will obviously impact performance.
   *
   * @return {Object} The resolved config.
   */
  getRawConfig (): Record<string, any> {
    return this._resolved
  }

  /**
   * Returns the labels from the entries
   *
   * @return {Object} The labels as an object just like getRawConfig,
   * where each key is setting name and its value is an array of string labels.
   * Entries with no labels are represented as an empty array (not undefined).
   */
  getLabels (): Record<string, any> {
    return this._labels
  }
}
