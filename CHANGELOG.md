## 2.0.2 - Sun May 31 2020 01:07:09

**Contributor:** Theo Gravity

- Updated readme on getRawConfig()

A note has been added that `getRawConfig()` does not deep clone the object.

## 2.0.1 - Sun May 31 2020 00:52:30

**Contributor:** Theo Gravity

- Add getAssertValue(), Remove type-specific getters (#2)

Type-specific getters turned out to be unnecessary as the YAML parser already does proper type conversion internally.

I was unable to justify keeping them as a result, and removed them to simplify the API.

A new method, `getAssertValue()`, was added to ensure a value exists, and throw if it does not.

Due to the removal of the type-specific getters, the package major version has been updated.

## 1.0.6 - Sat May 30 2020 00:21:04

**Contributor:** Theo Gravity

- Add `getConfigForLabel()`

In `cerebro`, you can assign tags (it calls them `labels`) to settings to group settings under a particular tag.

Although it could do this, its usage was very limited as it does not have a getter to work with them.

The new method allows you to get a set of settings by its tag.

## 1.0.5 - Fri May 29 2020 01:45:20

**Contributor:** Theo Gravity

- Rename package from `prod-config` -> `configurity`

Thanks to reddit user `sieabah` for the suggestion.

## 1.0.4 - Thu May 28 2020 05:23:11

**Contributor:** Theo Gravity

- First version

- Define configuration using a YAML file (you can still use the original `Cerebro` object if you want to use JSON)
- environment variable overrides
- Incorporates [AND of settings](https://github.com/yahoo/cerebro/pull/14) by @lpw
- Updated parts of the codebase to Typescript
- Updated parts of the codebase to classes
- Updated toolchain to be typescript-based
- Added new methods to the config object
- Re-written readme / updated usage examples to use the YAML format instead
