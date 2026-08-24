# typed-regex-poc

PoC type-level state machine for mapping RegExp string literas to `RegExpMatchArray` types. Infers capture group tuples and named group objects without build-step macro.

## Usage

```ts
const r = typedRegex(`^(?<year>\\d{4})-(?<month>\\d{2})$`);
const m = r.exec("2026-10");

// Type inference:
// m[0]: string
// m[1]: string
// m[2]: string
// m.groups: { year: string | undefined, month: string | undefined }
```

## Limitations

- TypeScript fails to resolve types for patterns exceeding ~60 syntax nodes. Patterns beyond this threshold resolve to any or trigger compiler errors.
- Alternations (a)|(b) are not computed as tuple unions. The state machine ignores the | operator and merges elements into a single tuple.
- Complex escape sequences inside character classes (e.g., [\]\\]) break type inference. Template literal types lack a full lexer.
