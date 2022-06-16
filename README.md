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

## Prerequisites

⚠️ If import aliases are used, they must be defined as `tsconfig.json` in the repository root. ⚠️

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

You can find an introduction to how the problem at hand is approached in the [docs](docs/INNER_WORKINGS.md).

# TODOs
- [] Handle TS Aliases (next step)
- [] Improve algorithm performance
- [] Test for windows
- [] migrate to typescript
- [] Add proper unit test using `RuleTester` from [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)

