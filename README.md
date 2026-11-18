# typed-regexp

Type-level state machine for mapping RegExp string literals to `RegExpExecArray` types. Infers capture group tuples and named group objects at compile time with zero dependencies, no build-step macros, and a 1-line runtime (`new RegExp`).

## Usage

```ts
import { typedRegex } from "typed-regexp";

// 1. Named groups, non-capturing groups, character classes & optionality
const dateRe = typedRegex("^(?<year>\\d{4})-(?:\\d{2})(?:-(?<day>[\\d()]+))?$");
const match = dateRe.exec("2025-05");

if (match) {
  const [full, year, day] = match;
  //     ^? [string, string, string | undefined]

  match.groups;
  //    ^? { year: string; day: string | undefined }
}

// 2. Alternation marks branch captures as optional
const altRe = typedRegex("^((?<word>[a-z]+)|\\d+)$");
const altMatch = altRe.exec("123");
if (altMatch) {
  altMatch[1]; // string
  altMatch[2]; // string | undefined
  altMatch.groups.word; // string | undefined
}

// 3. Compile-time validation for unbalanced groups/character classes
typedRegex("(?<id>\\d+"); // ❌ TS Error: Argument of type 'string' is not assignable to parameter of type 'never'
```

## Supported Syntax

| Construct                   | Example                                                 | Inferred Capture                                      |
| --------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Capture group               | `(\d+)`                                                 | `string` in tuple                                     |
| Named group                 | `(?<id>\d+)`                                            | `string` in tuple + `{ id: string }` in `groups`      |
| Non-capturing / Lookarounds | `(?:...)`, `(?=...)`, `(?!...)`, `(?<=...)`, `(?<!...)` | Ignored (inner captures preserved)                    |
| Optional quantifiers        | `(...)?`, `(...)*`, `(...){0,n}`                        | Marks group and nested captures `string \| undefined` |
| Alternation                 | `(a)\|(b)`                                              | Marks captures in branches `string \| undefined`      |
| Escapes & char classes      | `\(`, `[(]`                                             | Ignored by group parser                               |
| Unbalanced `(` / `)` / `[`  | `(?<a`                                                  | Compile-time type error (`never`)                     |

## How It Works

`InferRegExp<P>` is a tail-recursive template literal parser with a stack of group frames (`types.ts`). Each opening parenthesis pushes a frame onto the stack; closing `)` pops the frame, inspects the following quantifier (`?`, `*`, `{0,`) or internal `|` alternation flag, and merges the tuple and `groups` record into the parent frame.

At runtime, `typedRegex(pattern, flags)` simply returns `new RegExp(pattern, flags)` cast to `TypedRegExp<P>`.

## Limitations

- **Literal strings only**: `pattern` must be a string literal (not a dynamic `string` or `RegExp` literal `/.../`).
- **Recursion depth**: Very long patterns (~500+ characters) may hit TypeScript's tail-recursion instantiation limit (`TS2589`).
