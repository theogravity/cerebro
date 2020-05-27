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
  isEnabled(name: string): boolean
  getValue<T = any>(name: string): T
  dehydrate(): string
  getRawConfig(): Record<string, any>
  getLabels(): Record<string, any>
}
