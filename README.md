# configurity

[![NPM version](https://img.shields.io/npm/v/configurity.svg?style=flat-square)](https://www.npmjs.com/package/configurity)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A production-grade configuration system.

This is a developer-friendly improvement on the battle-tested configuration library 
[`cerebro`](https://github.com/yahoo/cerebro) used at Yahoo and Samsung properties 
serving millions of users.

- Define your configuration using YAML.
- Override any YAML configuration using environment variables.
- Use alternate configuration values based on a defined context.
  * Want to use one value for dev and another for production? You can!
  * Dynamically adjust config values through things like query parameters - great for doing things 
  like bucket (A/B-style) testing.
  * ...and much more!  
- Group settings by tags (aka `labels`)
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
  - [Static configuration: `loadStaticConfig(yamlFilePath, context?, overrides?)`](#static-configuration-loadstaticconfigyamlfilepath-context-overrides)
    - [Overriding configuration using environment variables](#overriding-configuration-using-environment-variables)
      - [Via `process.env`](#via-processenv)
      - [via command line](#via-command-line)
        - [Specifying objects](#specifying-objects)
        - [Specifying arrays](#specifying-arrays)
  - [Dynamic configuration: `getDynamicConfigBuilder(yamlFilePath)`](#dynamic-configuration-getdynamicconfigbuilderyamlfilepath)
- [`CerebroConfig` API](#cerebroconfig-api)
  - [`getAssertValue(settingName: string) : any`](#getassertvaluesettingname-string--any)
  - [`getValue(settingName: string) : any`](#getvaluesettingname-string--any)
  - [`getRawValue(settingName: string): any`](#getrawvaluesettingname-string-any)
  - [`isEnabled(settingName: string) : boolean`](#isenabledsettingname-string--boolean)
  - [`getRawConfig() : object`](#getrawconfig--object)
  - [`getConfigForLabel(labelName: string): object`](#getconfigforlabellabelname-string-object)
  - [`getConfigValueForLabel(labelName: string, settingName: string): any`](#getconfigvalueforlabellabelname-string-settingname-string-any)
  - [`getLabels(): object`](#getlabels-object)
- [Configuration Rules](#configuration-rules)
  - [Basic configuration](#basic-configuration)
  - [Group settings by a set of labels](#group-settings-by-a-set-of-labels)
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
  - [Configuration polling](#configuration-polling)
- [Looking for a production grade error handling infrastructure?](#looking-for-a-production-grade-error-handling-infrastructure)

<!-- TOC END -->

## Install

`$ npm i configurity --save`

## Getting started

### Static configuration: `loadStaticConfig(yamlFilePath, context?, overrides?)`

`loadStaticConfig<Flags extends Record<string, any> = Record<string, any>>(yamlFilePath, context?, overrides?)`

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

interface Settings {
  enable_database: boolean
  max_power: number
  database_name: string
}

// config is an instance of CerebroConfig
const config = loadStaticConfig<Settings>('example.yaml', context)

// pluck a boolean value
const databaseEnabled = config.isEnabled('enable_database')

// pluck any other value that is not boolean
const databaseName = config.getValue('database_name')

// Third param is a set of overrides that has first priority over any resolved or environment value
// database_name will always be 'overwritten'
// const config = loadStaticConfig('example.yaml', context, { database_name: 'overwritten' })

console.log(config.getRawConfig())
```

Outputs:

```json
{"enable_database":true,"max_power":0,"database_name":"prd-database"}
```

#### Overriding configuration using environment variables

*This only applies to static configuration. In dynamic configuration, you will have to manually pluck out
your environment variables into the overrides object.*

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

### Dynamic configuration: `getDynamicConfigBuilder(yamlFilePath)`

`getDynamicConfigBuilder<Flags extends Record<string, any> = Record<string, any>>(yamlFilePath)`

If you have configuration that should change during run-time, such as via an HTTP request based on 
query parameters, use dynamic configuration.

```typescript
import { getDynamicConfigBuilder } from 'configurity'

interface Settings {
  enable_database: boolean
  max_power: number
  database_name: string
}

// returns a function in the format of:
// configFn = (context, overrides = {}) => CerebroConfig
const configFn = getDynamicConfigBuilder<Settings>('settings.yaml')

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
 
  const configValue = config.getValue('max_power')
})
```

## `CerebroConfig` API

`CerebroConfig<Flags extends Record<string, any> = Record<string, any>>` is the object returned by `loadStaticConfig()` and `getDynamicConfigBuilder()`.

`Flags` is an optional generic that allows you to define an interface for your settings.

Use the API methods to fetch values from your configuration.

### `getAssertValue(settingName: string) : any`

Gets the requested value if it is not a `Boolean`.

Throws an error if the requested value is a `Boolean`, `null`, `undefined`, or is an empty string.

`const value = config.getAssertValue('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is a number type
const value = config.getAssertValue('setting_name')
```

### `getValue(settingName: string) : any`

Gets the requested value if it is not a `Boolean`.  Returns `null` if the value does not exist.

Throws an error if the requested value is a `Boolean`.

`const value = config.getValue('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is a number type
const value = config.getValue('setting_name')
```

### `getRawValue(settingName: string): any`

Gets the requested value in its raw form. No checks are performed on it.

`const value = config.getRawValue('setting_name')`

If you're using Typescript, you can assign a type to it:

```typescript
// the value you're fetching is a string
const value = config.getRawValue('setting_name')
```

### `isEnabled(settingName: string) : boolean`

This is recommended for feature flags.

Gets the requested value if it is a `Boolean`. Returns `null` if the value does not exist.

Throws an error if the requested value is not a `Boolean`.

`const isEnabled = config.isEnabled('setting_name')`

### `getRawConfig() : object`

Returns the resolved configuration as an object.

*NOTE: This does not deep clone the object, which means that clients could abuse this
by changing values.  Doing a deep clone will obviously impact performance.*

### `getConfigForLabel(labelName: string): object`

Get an object returning only the settings and their values that was categorized under a label.

```yaml
- setting: without_label
  value: blah

- setting: database_name
  # categorize the setting under the server and database labels
  labels: ['server', 'database']
  value: db-name

- setting: service_port
  labels: ['server']
  value: 3000
```

```typescript
// get only the settings marked under server
const obj = config.getConfigForLabel('server')
```

```typescript
{ "database_name": "db-name", "service_port": 3000 }
```

### `getConfigValueForLabel(labelName: string, settingName: string): any`

Get the value of a setting that was categorized under a label. Returns null if the setting does not exist.

### `getLabels(): object`

Returns an object in the form of `{ <setting_name>: <array of labels> }`.

For settings without labels, an empty array is assigned instead.

## Configuration Rules

### Basic configuration

- Each item in the YAML file must be an array item that is an object containing a `setting` and a `value`.
- The `setting` is the setting name, and the `value` is the value to assign to that setting.

```yaml
- setting: config_name
  value: config_value
```

### Group settings by a set of labels

You can assign labels to settings and use `getConfigForLabel(label)` to only get settings categorized
by that label.

```yaml
- setting: database_name
  # categorize the setting under the server and database labels
  labels: ['server', 'database']
  value: db-name
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

##### Multiple dependencies (AND operation)

The value `true` will be used only if the value of `foo` and `bar` is true.

```yaml
- setting: andOfFooAndBar
  value: false
  except:
    - value: true
      setting: ['foo', 'bar']
```

##### Multiple dependencies (OR operation)

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
  # Assign a label to the setting for grouping settings together
  labels: ['server']
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

### Configuration polling

This option is useful for having live configuration that updates without having to re-deploy your application. A poller object continuously calls a `fetch` function to retrieve a newer version of the configuration. This is very open ended to allow for different security mechanisms such as mTLS or signed responses.

Optionally (but recommended), a configuration schema can be given to the poller to ensure that the response is a valid configuration.

```typescript
import { ConfigPoller } from 'configurity';

const poller = new ConfigPoller({
  clientSchema: /* optional schema */,
  interval: 5000,
  fetch: async function() {
    const response = await fetch(/* ... */);

    return response.json();
  }
});

const cerebro = new Cerebro(config, {
  poller
});
```

# Looking for a production grade error handling infrastructure?

Try out https://github.com/theogravity/new-error
