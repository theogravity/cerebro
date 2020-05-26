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
  customEvaluators?: { [key: string]: Function }
}

export interface ICerebroContext {
  percentageSeed?: string | number
  [key: string]: any
}

export interface ICerebroConfigOptions {
  overrides?: { [key: string]: any }
}

export interface ICerebroConfig {
  isEnabled(name: string): boolean
  getValue(name: string): any
  dehydrate(): string
  getRawConfig(): Record<string, any>
  getLabels(): Record<string, any>
}
