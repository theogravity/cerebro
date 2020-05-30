## 1.0.6 - Sat May 30 2020 00:21:04

**Contributor:** Theo Gravity

- Merge pull request #1 from theogravity/get-labels

Add `getConfigForLabel()`

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
