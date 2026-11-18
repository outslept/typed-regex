import { expect, expectTypeOf, test } from "vite-plus/test";
import { typedRegex } from "../src/index.js";

test("typedRegex executes and narrows positional and named groups", () => {
  const rx = typedRegex("^(?<year>\\d{4})-(\\d{2})(?:-(?<day>\\d{2}))?$", "i");

  const full = rx.exec("2025-09-14");
  expect(full).not.toBeNull();
  if (!full) return;

  expectTypeOf(full[0]).toEqualTypeOf<string>();
  expectTypeOf(full[1]).toEqualTypeOf<string>();
  expectTypeOf(full[2]).toEqualTypeOf<string>();
  expectTypeOf(full[3]).toEqualTypeOf<string | undefined>();
  expectTypeOf(full.groups).toEqualTypeOf<{
    year: string;
    day: string | undefined;
  }>();

  expect(full[0]).toBe("2025-09-14");
  expect(full[1]).toBe("2025");
  expect(full[2]).toBe("09");
  expect(full[3]).toBe("14");
  expect(full.groups).toEqual({ year: "2025", day: "14" });

  const partial = rx.exec("2025-09");
  expect(partial?.[3]).toBeUndefined();
  expect(partial?.groups.day).toBeUndefined();

  expect(rx.exec("invalid")).toBeNull();
});

test("typedRegex rejects invalid group syntax at compile time", () => {
  expect(() => {
    // @ts-expect-error unbalanced opening paren resolves to never
    typedRegex("(abc");
  }).toThrow(SyntaxError);
});
