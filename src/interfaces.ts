export interface ICerebroConfigEntry {
  setting: string
  value: any
  except?: ICerebroConfigEntryException[]
}

export type ICerebroConfigEntryException = {
  value: any
  [key: string]: any
}

export interface ICerebroOptions {
  customEvaluators?: Record<string, Function>
}

export interface ICerebroContext {
  percentageSeed?: string | number
  [key: string]: any
}

export interface ICerebroConfigOptions {
  overrides?: Record<string, any>
}

export interface ICerebroConfig {
  /**
   * Gets the requested value if it is a Boolean.  Returns null if the value does not exist.
   * Throws an error if the requested value is not a Boolean.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {Boolean|null} The value of the setting
   */
  isEnabled(name: string): boolean
  /**
   * Gets the requested value as an object. Returns null if the value does not exist.
   * Throws an error if the requested value is not an object.
   * @param {String} name The name of the setting that you want to value of
   * @return {Object|null} The value of the setting
   */
  getValueAsObject(name: string): Record<string, any>
  /**
   * Gets the requested value as an integer. Returns null if the value does not exist.
   * Throws an error if the requested value is not a number.
   * @param {String} name The name of the setting that you want to value of
   * @return {Number|null} The value of the setting
   */
  getValueAsInt(name: string): number
  /**
   * Gets the requested value as a float. Returns null if the value does not exist.
   * Throws an error if the requested value is not a number.
   * @param {String} name The name of the setting that you want to value of
   * @return {Number|null} The value of the setting
   */
  getValueAsFloat(name: string): number
  /**
   * Gets the requested value as an array. Returns null if the value does not exist.
   * Throws an error if the requested value is not an array.
   * @param {String} name The name of the setting that you want to value of
   * @return {Array|null}
   */
  getValueAsArray<T = any>(name: string): Array<T>
  /**
   * Gets the requested value if it is not a Boolean.  Returns null if the value does not exist.
   * Throws an error if the requested value is a Boolean.
   *
   * @param {String} name The name of the setting that you want to value of
   * @return {!Boolean|*} The value of the setting
   */
  getValue<T = any>(name: string): T
  /**
   * Serializes the object to send to the client.
   * Intended to be used on the server.
   * The output of this function must be rehydrated on the client.
   *
   * @return {JSON} Map of settings to values.
   */
  dehydrate(): string
  /**
   * Returns the resolved config.
   * NOTE: This does not deep clone the object, which means that clients could abuse this
   * by changing values.  Doing a deep clone will obviously impact performance.
   *
   * @return {Object} The resolved config.
   */
  getRawConfig(): Record<string, any>
  /**
   * Returns the labels from the entries
   *
   * @return {Object} The labels as an object just like getRawConfig,
   * where each key is setting name and its value is an array of string labels.
   * Entries with no labels are represented as an empty array (not undefined).
   */
  getLabels(): Record<string, any>
}
