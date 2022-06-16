# How this works internally (WIP)

An eslint rule can require the cwd of a current file (see their [docs on how to write rules](https://eslint.org/docs/developer-guide/working-with-rules)). It can also parse all import paths.

Imagine eslint is used in a repository that is located on disk at `~/dev/my_repo`.
It inspects a file `src/components/Foo/Foo.js` that imports from `src/components/Foo/Bar/Bar.js` via absolute import.

```js
// CWD of file visited by eslint: ~/dev/my_repo/src/components/Foo/Foo.js

// Absolute import that we want to fix, because it can be relative
import Bar from "src/components/Foo/Bar/Bar.js" // -> can be import Bar from "./Bar/Bar.js"
```

We want to change the import path from `src/components/Foo/Bar/Bar.js` to be `./Bar/Bar.js`.
by replacing `src/components/Foo` with a `.`, to make it a relative import path.

We can determine the to-be-replaced-wth-a-dot string (`src/components/Foo`) by finding the *largest overlap* between the
import path and the CWD.

```
import path          [src/components/Foo]/Foo
cwd                  ~/dev/my_repo/[src/components/Foo]
largest overlap     src/components/Foo
```

Now within the import path, we search for that largest overlap and replace it with a dot.

```js
// Fixed file

// Absolute import that we want to fix, because it can be relative
import Bar from "./Bar/Bar.js" // -> can be import Bar from "./Bar/Bar.js"
```

So far we looked at the happy path. Let's look at things that complicate the case.

### Checking if an intersection is valid and can be replaced with a dot

What if we can only match a single character or two or three of them?
In some cases that works ...

```
CWD of file:    ~dev/repo/a
import:         a/b
overlap:        a
result import:  ./b ✅
```

In some cases it does not.

```
CWD of file:    ~dev/foo/baz/bar
import:         bumms
overlap:        b
result import:  .umms ❌

CWD of file:    ~dev/foo/baz/bar
import:         part
overlap:        a
result import:  p.art ❌
```

Therefore we only consider an overlap if the replacement of it in the import path results in a valid relative import path (if it starts with `./`)

### Import Aliases (WIP)

A modern JS/TS-based project can define import aliases using [webpack`s resolve option](https://webpack.js.org/configuration/resolve/) or [path mappings specified tsconfig](https://www.typescriptlang.org/docs/handbook/module-resolution.html).

As an example, `~` can be an alias for all code under `<repository-root>/src`.

The logic sketched until now cold not be applied:

```
cwd of visted file:                 ~/dev/my_repo/src/components/Foo
import path stated in that file:    ~/components/Foo/Bar
largest overlap                     /components/Foo
↓
Result of replacing overlap 
in import path with a dot:          ~./Bar
```

We can solve this by
- restricting the usage of this plugin for repositories that define aliases in tsconfig
- importing the tsconfig and reading its properties for module resolution (`baseUrl` and `paths`)
- replacing an alias found in an import path with the actual directory/file path stated in the path mapping.



### Largest Overlap between cwd and import path is not unique

Image a file located at `~/dev/my_repo/foo/bar/baz/foo/bar` that imports from `foo/bar/baz/foo/bar/baz`. The largest overlap between CWD and import path would be `foo/bar`, but we only want to replace the last occurrence within the import path.
