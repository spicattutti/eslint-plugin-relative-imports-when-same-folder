# eslint-plugin-relative-imports-when-same-folder

An eslint plugin that converts any absolute import paths to relative ones **if a file is imported from within the same directory**.

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


## Disclaimer

This Plugin is not battle-tested, so consider it as ⚠️ not production ready ⚠️.
Until it gets released to npm it is a Proof of concept.

## Prerequisites / Limitations

⚠️ Import aliases must be defined as `tsconfig.json` in the repository root. ⚠️

Contributions to how to retrieve module resolution mappings out of a webpack config are welcome.
As a workaround to this limitation, you could re-use or re-declare webpack aliases in tsconfig.

This plugin only attempts to support the [Node Module resolution strategy](https://www.typescriptlang.org/docs/handbook/module-resolution.html#module-resolution-strategies).


Using [rootDirs](https://www.typescriptlang.org/tsconfig#rootDirs) is also not supported.

## Setup Instructions 

TBD

## Example Repo

TBD

# How this was born

In a codebase, we wanted to have three kinds of import blocks:
1. Third party modules (e.g. `lodash`)
2. Imports from outside the folder the current file is in (e.g. `src/utils/some_util`)
3. Imports from within the same file, as relative imports (`./some_sub_component`)

We utilized [import/order](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md) for the ordering as well as [eslint-plugin-no-relative-import-paths](https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths) with `allowSameFolder`) to only allow imports from within the same file. Using that setup we could enforce allmost all of the mentioned constraints we wanted to apply:
- imports where ordered in those mentioned blocks
- relative imports where only allowed from within the same folder

What was missing was automation to refactor all absolute imports that can be relative to actually be relative, so they are moved to the last block.

# How to contribute

See the [contributing](CONTRIBUTING.md) guide for broad instructions on how to get started with this project.

You can find an introduction to how the problem at hand is approached in the [docs](docs/INNER_WORKINGS.md).

# TODOs
- [] check eslint settings to tell clients that this is a plugin for ts-parser
- [] Optimize reversing TS module resolution: Instead of resolving the lookup with a path starting from the BaseUrl, we could use the cwd of tsconfig to get absolute paths in terms of file system. That greatly de-complexes matching the common part in import path and the cwd of the linted file, because we do not have to look for the largest overlap anymore, but instead just remove the common file path start.
- [] Test for windows
- [] Review algorithmic performance, thereby support optimizations with ..
- [] Performance testing, see https://www.darraghoriordan.com/2021/11/06/how-to-write-an-eslint-plugin-typescript/
- [] migrate to typescript !
- [] Add proper unit test using `RuleTester` from [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- [] Check for a lib that helps with dealing with globs instead of verbosely hand-rolling the string manipulation logic
= [] Solidify reverse mapping of path aliases with more tests, preferably using real world configs