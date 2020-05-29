# configurity

[![NPM version](http://img.shields.io/npm/v/configurity.svg?style=flat-square)](https://www.npmjs.com/package/configurity)
[![CircleCI](https://circleci.com/gh/theogravity/configurity.svg?style=svg)](https://circleci.com/gh/theogravity/configurity) 
![built with typescript](https://camo.githubusercontent.com/92e9f7b1209bab9e3e9cd8cdf62f072a624da461/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f4275696c74253230576974682f547970655363726970742f626c7565) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A production-grade configuration system.

This is a developer-friendly improvement on the battle-tested configuration library [`cerebro`](https://github.com/yahoo/cerebro) used at Yahoo and Samsung properties serving millions of users.

- Define your configuration using YAML.
- Use alternate configuration values based on a defined context.
  * Want to use use one value for dev, and another for production? You can!
  * Dynamically adjust config values through things like query parameters - great for doing things 
  like bucket (A/B-style) testing.
  * ...and much more!  
- Override any configuration using environment variables.
- 99% test coverage

# Fork notice

This is a fork of the original Yahoo project, [`cerebro`](https://github.com/yahoo/cerebro).

Changes:

- Define configuration using a YAML file (you can still use the original `Cerebro` object if you want to use JSON)
- environment variable overrides
- Incorporates [AND of settings](https://github.com/yahoo/cerebro/pull/14) by @lpw
- Updated parts of the codebase to Typescript
- Updated parts of the codebase to classes
- Updated toolchain to be typescript-based
- Added new methods to the config object
- Re-written readme / updated usage examples to use the YAML format instead

# Table of Contents

<!-- TOC -->
- [Install](#install)
- [Getting started](#getting-started)
  - [Static configuration: `loadStaticConfig(yamlFile, context?, overrides?)`](#static-configuration-loadstaticconfigyamlfile-context-overrides)
    - [Overriding configuration using environment variables](#overriding-configuration-using-environment-variables)
      - [Via `process.env`](#via-processenv)
      - [via command line](#via-command-line)
        - [Specifying objects](#specifying-objects)
        - [Specifying arrays](#specifying-arrays)
  - [Dynamic configuration: `getDynamicConfigBuilder(yamlFile)`](#dynamic-configuration-getdynamicconfigbuilderyamlfile)
- [`CerebroConfig` API](#cerebroconfig-api)
  - [Basic getters](#basic-getters)
    - [`getRawConfig() : object`](#getrawconfig--object)
    - [`getValue(settingName: string) : any`](#getvaluesettingname-string--any)
    - [`isEnabled(settingName: string) : boolean`](#isenabledsettingname-string--boolean)
  - [Type-specific getters](#type-specific-getters)
    - [`getString(settingName: string) : string`](#getstringsettingname-string--string)
    - [`getInt(settingName: string) : number`](#getintsettingname-string--number)
    - [`getFloat(settingName: string) : number`](#getfloatsettingname-string--number)
    - [`getArray(settingName: string): Array`](#getarraysettingname-string-array)
    - [`getObject(settingName: string): object`](#getobjectsettingname-string-object)
    - [`getRawValue(settingName: string): any`](#getrawvaluesettingname-string-any)
- [Configuration Rules](#configuration-rules)
  - [Basic configuration](#basic-configuration)
  - [Context-based configuration](#context-based-configuration)
    - [Evaluation Order](#evaluation-order)
    - [Supported Formats for Context Checks in Except](#supported-formats-for-context-checks-in-except)
      - [Enums](#enums)
        - [None / All](#none--all)
    - [Set value based on ranges](#set-value-based-on-ranges)
    - [Dependent settings](#dependent-settings)
      - [Basic dependency](#basic-dependency)
        - [Multiple dependencies (AND operation)](#multiple-dependencies-and-operation)
        - [Multiple dependencies (OR operation)](#multiple-dependencies-or-operation)
- [Full example YAML](#full-example-yaml)
- [Benchmarking](#benchmarking)

<!-- TOC END -->

## Install

`$ npm i configurity --save`

## Getting started

### Static configuration: `loadStaticConfig(yamlFile, context?, overrides?)`

If you have configuration that never changes during run-time, static configuration is recommended.

Given the following yaml definition:

```yaml
- setting: enable_database
  value: true

- setting: max_power
  value: 1
  except:
   - value: 0
     environment:
       - production
     power: low

- setting: database_name
  value: test-database
  except:
    - value: prd-database
      environment:
        - production
```

Get the config values with a custom context.

```typescript
import { loadStaticConfig } from 'configurity'

// Optional, specify a set of context dimensions that determines
// what configuration values to use
const context = {
  environment: 'production',
  power: 'low'
}

// config is an instance of CerebroConfig
const config = loadStaticConfig('example.yaml', context)

// Third param is a set of overrides that has first priority over any resolved or environment value
// database_name will always be 'overwritten'
// const config = loadStaticConfig('example.yaml', context, { database_name: 'overwritten' })

console.log(config.getRawConfig())

// pluck a boolean value
const databaseEnabled = config.isEnabled('enable_database')
```

Outputs:

```json
{"enable_database":true,"max_power":0,"database_name":"prd-database"}
```

#### Overriding configuration using environment variables

You can override any configuration value by specifying an environment variable of the same name. 

*If you specify an `override` object, it will take precedence over an environment variable.*

##### Via `process.env`

You can override the `enable_database` value above using the following before
calling `loadConfig()`:

`process.env.enable_database = false`

##### via command line

`$ enable_database=false node app.js`

###### Specifying objects

`$ enable_database="{\"test\": \"blah\"}" node app.js`

###### Specifying arrays

`$ enable_database="[\"test\", \"blah\"]" node app.js`

### Dynamic configuration: `getDynamicConfigBuilder(yamlFile)`

If you have configuration that should change during run-time, such as via an HTTP request based on 
query parameters, use dynamic configuration.

```typescript
import { getDynamicConfigBuilder } from 'configurity'

// returns a function in the format of:
// configFn = (context, overrides = {}) => CerebroConfig
const configFn = getDynamicConfigBuilder('settings.yaml')

// express middleware example
export function middleware((req, res) => {
  const context = {
    // this is not a safe example - always sanitize any kind of user input!
    power: req.query.power,
    environment: process.env.NODE_ENV
  }
 
  // example 1: construct the configuration based on the context
  const config = configFn(context)
  
  // example 2: an override can be specified that will override any config value
  // the value of max_power will always be 0 here
  // config = configFn(context, { max_power: 0 })
 
  const configValue = config.getInt('max_power')
})
```

## `CerebroConfig` API

Use the API to fetch values from your configuration.

### Basic getters

Configuration values are accessed via the `CerebroConfig` API.

#### `getRawConfig() : object`

Returns the resolved configuration as an object.

#### `getValue(settingName: string) : any`

Gets the requested value if it is not a `Boolean`.  Returns `null` if the value does not exist.

Throws an error if the requested value is a `Boolean`.

`const value = config.getValue('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is a number type
const value = config.getValue<number>('setting_name')
```

#### `isEnabled(settingName: string) : boolean`

This is recommended for feature flags.

Gets the requested value if it is a `Boolean`. Returns `null` if the value does not exist.

Throws an error if the requested value is not a `Boolean`.

`const isEnabled = config.isEnabled('setting_name')`

### Type-specific getters

In most use-cases, you can use `getValue()` (for all types but `boolean`), and `isEnabled()`.

These methods are provided if you want to return `null` if the value is not of that type.

#### `getString(settingName: string) : string`

Gets the requested value as a string. Returns `null` if the value does not exist or is not a string.

`const value = config.getString('setting_name')`

#### `getInt(settingName: string) : number`

Gets the requested value as an integer. Returns `null` if the value does not exist or is not a number.

`const value = config.getInt('setting_name')`

#### `getFloat(settingName: string) : number`

Gets the requested value as a float. Returns `null` if the value does not exist or is not a number.

`const value = config.getFloat('setting_name')`

#### `getArray(settingName: string): Array`

Gets the requested value as an array. Returns `null` if the value does not exist or is not an array.

`const values = config.getArray('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is an array of numbers
const values = config.getArray<number>('setting_name')
```

#### `getObject(settingName: string): object`

Gets the requested value as an object. Returns `null` if the value does not exist or is not an object.

`const obj = config.getObject('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is an object containing string values
const obj = config.getObject<string>('setting_name')
```

#### `getRawValue(settingName: string): any`

Gets the requested value in its raw form. No checks are performed on it.

`const value = config.getRawValue('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is a string
const value = config.getRawValue<string>('setting_name')
```

## Configuration Rules

### Basic configuration

- Each item in the YAML file must be an array item that is an object containing a `setting` and a `value`.
- The `setting` is the setting name, and the `value` is the value to assign to that setting.

```yaml
- setting: config_name
  value: config_value
```

### Context-based configuration

- You can specify alternate configuration based on the context input by specfying an `except` property.
- Except must be an array
- The elements of except must be objects.
- An element of except must contain value, and this value must not be undefined.

Settings are defined formally in `src/validators/schema.json`.

```yaml
# override the value based on a context
# use the alternative value "prd-database"
# if the "environment" context property value is "production" or "stage"
- setting: database
  # default value
  value: test-database
  except:
    - value: prd-database
      environment:
        - production
        - stage
```

#### Evaluation Order

- If all the criteria in an `except` block is met, the value in the except block will be used. 
  * The except blocks are evaluated in-order, and it **stops** evaluation once it finds a match.  
- If no `except` block matches fully, then the default value is used.

Given this configuration:

```yaml
- setting: timer
  value: 30
  except:
    # First item in evaluation
    - value: 15
      environment: 
        - alpha
    # Second item
    - value: 20
      environment:
        - alpha
      bucket: a
```

And the context dimensions:

```js
const context = {
  environment: 'alpha',
  bucket: 'a'
}
```

The output will be:

```json
{ "timer": 15 }
```

This is because the evaluator ends once conditions are met, and in the first exception rule,
the setting `timer` is set to 15 when the environment is `alpha` only.

This can be fixed by re-ordering the exception items:

```yaml
- setting: timer
  value: 30
  except:
    - value: 20
      environment:
        - alpha
      bucket: a
    - value: 15
      environment: 
        - alpha
```

#### Supported Formats for Context Checks in Except

##### Enums

The except value will be used if the `bucket` dimension value is either `a` or `b`:

```yaml
- setting: enableNewFeature
  value: false
  except:
    - value: true
      bucket:
        - a
        - b
```

Can also be written as:

```yaml
- setting: enableNewFeature
  value: false
  except:
    - value: true
      bucket: ['a', 'b']
```

###### None / All

Enums also support two additional options, `none` and `all`:

`all`: If the context has a `partner` dimension with any kind of value, it will match.

```yaml
- setting: enableNewFeature
  value: false
  except:
    # This value will be used if partner has any kind of value set
    - value: true
      partner: ['all']
```

`none`: If the context has a `partner` dimension with any kind of value, the **default** value will be used.

```yaml
- setting: enableNewFeature
  # This value will be used if partner is defined
  value: false
  except:
    # Used if partner is *not* defined
    - value: true
      partner: ['none']
```

#### Set value based on ranges

You can specify a value to use if a dimension happens to fall in a range of values.

- An inclusive range looks like this: `rangeExample: ['1000..2000']`.
- An exclusive range looks like this: `rangeExample: ['1000...2000']`.

In the following example, if the context contains a dimension called `userBirthdayYear` 
that is anywhere between 2000 and 2010, exclusive, `enableNewFeature` will be `true`.

```yaml
- setting: enableNewFeature
  value: false
  except:
    - value: true
      userBirthdayYear: ['2000...2010']
```

#### Dependent settings

You can have a setting be dependent on another setting.

##### Basic dependency

`dependent` will not be enabled unless `independent` is aldo enabled.

```yaml
- setting: independent
  value: false
  except:
    - value: true
      environment: ['alpha']

- setting: dependent
  value: false
  except:
    - value: true
      setting: independent
```

###### Multiple dependencies (AND operation)

The value `true` will be used only if the value of `foo` and `bar` is true.

```yaml
- setting: andOfFooAndBar
  value: false
  except:
    - value: true
      setting: ['foo', 'bar']
```

###### Multiple dependencies (OR operation)

```yaml
- setting: andOfFooOrBar
  value: false
  except:
    - value: true
      setting: foo
    - value: true
      setting: bar
```

## Full example YAML

```yaml
# Sample configurity configuration file

# Set a key called "username" with a value of "my-username"
- setting: username
  value: my-username

- setting: password
  value: my-password

# duplicate keys are *ignored*
- setting: password
  value: overriden

# override the value based on a context
# use the alternative value "prd-database"
# if the "environment" context dimension value is "production" or "stage"
- setting: database
  # default value if no context is specified
  value: test-database
  except:
    - value: prd-database
      environment:
        - production
        - stage

# If the context contains
# "production" or "stage" for the "environment" context
# *and* "a" for the "bucket" context, then use the value of 50
- setting: bucket_test
  value: 100
  except:
    - value: 50
      # alternate way to write an array
      environment: ['production', 'stage']
      bucket: a

- setting: a_number
  value: 1

- setting: an_array
  value:
    - apples
    - oranges

- setting: an_object
  value:
    # notice there are no dashes here,
    # each item is a key/value pair in an object
    sampleKey: 1234
    sampleKey2: 12345.6

# you can leave a key without a value
# this will be interpreted as a null
- setting: a_null
  value:

- setting: noneFlag
  value: false
  except:
   - value: true
     # none is a special keyword - if the "environment" context *exists*,
     # then the default will be used
     environment: ['none']

- setting: allFlag
  value: false
  except:
    - value: true
      # all is a special keyword - if the "environment" context *exists*, then "true" will be used
      environment: ['all']

- setting: is_your_birthday_inc
  value: false
  except:
    - value: true
      # inclusive range, if "userBirthdayYear" falls between 2000 and 2010, inclusive, then value is "true"
      userBirthdayYear: ['2000..2010']

- setting: is_your_birthday_exc
  value: false
  except:
    - value: true
      # exclusive range, if "userBirthdayYear" falls between 2000 and 2010, exclusive, then value is "true"
      userBirthdayYear: ['2000...2010']

# Having a setting value be dependent on another
# Basic case
- setting: independent
  value: false
  except:
    - value: true
      environment: ['alpha']

- setting: dependent
  value: false
  except:
    - value: true
      setting: independent

# AND dependent case
- setting: foo
  value: true

- setting: bar
  value: true

- setting: andOfFooAndBar
  value: false
  except:
    - value: true
      setting: ['foo', 'bar']

# OR dependent case
- setting: andOfFooOrBar
  value: false
  except:
    - value: true
      setting: foo
    - value: true
      setting: bar
```

## Benchmarking

You can run a benchmark to understand how this package performs under certain conditions:

Check out this repository, install, and run:

`$ npm run bench`

Example output:

```
>> simple x 26,692,182 ops/sec ±2.43% (90 runs sampled)
>> simple with override x 16,374,548 ops/sec ±1.61% (87 runs sampled)
>> enum x 3,743,442 ops/sec ±1.53% (92 runs sampled)
>> range x 1,659,775 ops/sec ±8.57% (89 runs sampled)
>> custom evaluator x 3,264,366 ops/sec ±2.85% (88 runs sampled)
>> cross setting dependencies x 2,916,230 ops/sec ±2.13% (93 runs sampled)
>> multiple dimensions x 3,493,998 ops/sec ±1.41% (95 runs sampled)
>> multiple except blocks x 2,459,082 ops/sec ±1.15% (94 runs sampled)
>> random percentage x 3,732,457 ops/sec ±1.85% (92 runs sampled)
>> fixed percentage x 1,391,401 ops/sec ±1.48% (92 runs sampled)
>> template x 1,118,186 ops/sec ±2.31% (88 runs sampled)
>> huge x 3,517 ops/sec ±2.22% (87 runs sampled)
Fastest test is simple at 1.63x faster than simple with override
```
