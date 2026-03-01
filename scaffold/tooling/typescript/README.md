# @syndeocare/typescript-config

Shared TypeScript configurations for all SyndeoCare apps and packages.

## Configs

### Base (tsconfig.base.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": false,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### App (tsconfig.app.json)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "useDefineForClassFields": true
  },
  "include": ["src"]
}
```

### Node (tsconfig.node.json)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```
