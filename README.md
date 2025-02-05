# eslint-plugin-relative-imports-when-same-folder

[![npm version](https://badge.fury.io/js/eslint-plugin-relative-imports-when-same-folder.svg)](https://badge.fury.io/js/eslint-plugin-relative-imports-when-same-folder)
![example workflow](https://github.com/spicattutti/eslint-plugin-relative-imports-when-same-folder/actions/workflows/test_build_and_publish.yml/badge.svg)

An eslint plugin that converts any absolute import paths to relative ones **if a file is imported from within the same directory**.

Resolves absolute paths to paths on disk by parsing a `tsconfig.json` expected to be found in the root of the repository
using this plugin.

```ts
// ## Import sibling

// From within a file 
// src/Foo/Foo.js
// we want to import
// src/Foo/Baz.js

// OK
import Bar from "./Baz"; // valid relative path

// NOT OK
import Something from "src/Foo/Baz";
```

```ts
// ## Import descendant

// From within a file 
// src/Foo/Foo.js
// we want to import
// src/Foo/Bar/Bar.js

// OK
import Bar from "./Bar/Bar"; // valid relative path

// NOT OK
import Something from "src/Foo/Bar/Bar";
```


## Prerequisites / Limitations

### Module resolution must be defined in `tsconfig.json`

A modern JS/TS-based project can not only define some sort of baseUrl like `src`, it can also define import aliases using [webpack`s resolve option](https://webpack.js.org/configuration/resolve/) or [path mappings specified tsconfig](https://www.typescriptlang.org/docs/handbook/module-resolution.html).

As an example, `~` can be an alias for all code under `<repository-root>/src`.

This plugin checks resolution configs `baseUrl` and `paths` defined in single or nested `tsconfig.json`s. ️
It only supports the common [Node Module resolution strategy](https://www.typescriptlang.org/docs/handbook/module-resolution.html#module-resolution-strategies). There is no
support for [rootDirs](https://www.typescriptlang.org/tsconfig#rootDirs)

Contributions to make this more flexible or to retrieve module resolution mappings out of a webpack config are welcome.

As a workaround to this limitation, a project can re-use or re-declare import aliases that are defined in a webpack config in the project`s tsconfig.

### Default set of file extensions used when resolving paths

When an alias is mapped to a single path, we assume that another mechanism (e.g. TypeScript or [no-unresolved](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-unresolved.md)) already ensures that the de-aliased path is valid.

When an alias is mapped to more than one path, we check what de-aliased path can be resolved. Here we assume a default set
of file extensions.

```
[
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.scss',
    '.css',
    '.svg',
    '.json',
]
```

Based on demand, this can be made configurable.

# How to contribute

See the [contributing](CONTRIBUTING.md) guide for broad instructions on how to get started with this project.

## Setup Instructions 

To install, run
```
yarn add -D eslint-plugin-relative-imports-when-same-folder
```
respectively
```
npm install --save-dev eslint-plugin-relative-imports-when-same-folder
```

Then update your eslint config by adding `relative-imports-when-same-folder` to the list of plugins,
and turn on the main rule `no-relative-imports-when-same-folder` of this plugin.
```
// .eslintrc.js
  plugins: [
    // other plugins ..
    "relative-imports-when-same-folder",
  ],
  rules: {
    // other rules ..
    "relative-imports-when-same-folder/no-relative-imports-when-same-folder": "error",
  }
```

## Example Repo

Check out https://github.com/s-pic/fixmy.frontend/tree/use_eslint-plugin-relative-imports-when-same-folder.
It is a not too small, real-world project.

# How this was born

In a codebase, we wanted to have three kinds of import blocks:
1. Third party modules (e.g. `lodash`)
2. Imports from outside the folder the current file is in (e.g. `src/utils/some_util`)
3. Imports from within the same file, as relative imports (`./some_sub_component`)

We utilized [import/order](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md) for the ordering as well as [eslint-plugin-no-relative-import-paths](https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths) with `allowSameFolder`) to only allow imports from within the same file. Using that setup we could enforce allmost all of the mentioned constraints we wanted to apply:
- imports where ordered in those mentioned blocks
- relative imports where only allowed from within the same folder

What was missing was automation to refactor all absolute imports that can be relative to actually be relative, so they are moved to the last block.


# TODOs
- [ ] check eslint settings to tell clients that this is a plugin for ts-parser
- [ ] Support windows -> e.g. read and use [platform specific segment separator](https://nodejs.org/api/path.html#pathsep)
- [ ] Performance testing, see https://www.darraghoriordan.com/2021/11/06/how-to-write-an-eslint-plugin-typescript/
- [ ] migrate to typescript !
- [ ] Add proper unit test using `RuleTester` from [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- [ ] Check for a lib that helps with dealing with globs instead of verbosely hand-rolling the string manipulation logic
- [ ] Solidify reverse mapping of path aliases with more tests, preferably using real world configs
- [ ] Try to find a lib to reverse-map tsconfig module resolution configs. This must have been solved somewhere else already. Eventually we can feed aliases to `enhanced-resolve`

# Acknowledgements

Thanks [SMG](https://swissmarketplace.group/en/) for letting me work on company time.