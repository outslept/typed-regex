import { expectTypeOf, test } from "vite-plus/test";
import type { InferRegExp } from "../src/types.js";

test("InferRegExp infers positional, named and non-capturing groups", () => {
  expectTypeOf<
    InferRegExp<"(\\d{4})-(?<month>\\d{2})-(?:\\d{2})(?=end)(?!x)(?<=a)(?<!b)">
  >().toEqualTypeOf<{
    arr: [string, string];
    named: { month: string };
  }>();
});

test("InferRegExp marks groups with ?, *, {0, and | as optional", () => {
  expectTypeOf<InferRegExp<"(?<a1>a)?(b)*(c){0,2}">>().toEqualTypeOf<{
    arr: [string | undefined, string | undefined, string | undefined];
    named: { a1: string | undefined };
  }>();

  expectTypeOf<InferRegExp<"(?<left>a)|(?<right>b)">>().toEqualTypeOf<{
    arr: [string | undefined, string | undefined];
    named: { left: string | undefined; right: string | undefined };
  }>();
});

test("InferRegExp handles nested groups, character classes and escaped parens", () => {
  expectTypeOf<InferRegExp<"\\([\\]()]+(?<outer>a(?<inner>b))?\\)">>().toEqualTypeOf<{
    arr: [string | undefined, string | undefined];
    named: { outer: string | undefined; inner: string | undefined };
  }>();
});

test("InferRegExp resolves invalid group syntax to never", () => {
  expectTypeOf<InferRegExp<"(unclosed">>().toEqualTypeOf<never>();
  expectTypeOf<InferRegExp<"unopened)">>().toEqualTypeOf<never>();
  expectTypeOf<InferRegExp<"[unclosed">>().toEqualTypeOf<never>();
  expectTypeOf<InferRegExp<"(?<>a)">>().toEqualTypeOf<never>();
  expectTypeOf<InferRegExp<"(?<a)b)">>().toEqualTypeOf<never>();
  expectTypeOf<InferRegExp<"(?<unclosed">>().toEqualTypeOf<never>();
});
