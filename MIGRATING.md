# Migration Guide

## Migrating from 2.x to 3.x

This only applies if you use Typescript. The generics definitions have changed.

You can now define an interface for your settings and it will be recognized via autocompletion.

If you use generics with the `CerebroConfig` API, you will need to update your generics to match the new definitions.

This would apply to the following methods:

```typescript
  getRawValue()
  isEnabled()
  getValue()
  getAssertValue()
  getRawConfig()
```

Before:

```typescript
const value = config.isEnabled<boolean>('enable_database')
```

After (static config)

```typescript
import { loadStaticConfig } from 'configurity'

interface Settings {
  enable_database: boolean
}

const config = loadStaticConfig<Settings>('example.yaml')

// No need for the generic anymore, it should be inferred
const databaseEnabled = config.isEnabled('enable_database')
```

After (dynamic config)

```typescript
import { loadDynamicConfig } from 'configurity'

interface Settings {
  enable_database: boolean
}

const config = loadDynamicConfig<Settings>('example.yaml')

// No need for the generic anymore, it should be inferred
const databaseEnabled = config.isEnabled('enable_database')
```
