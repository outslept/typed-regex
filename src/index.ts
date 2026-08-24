import { parseStrict, type StrictASTNode } from "./ast.js";
import type { TypedMatchArray } from "./types.js";

export interface TypedRegex<P extends string> {
  readonly pattern: P;
  readonly flags: string;
  readonly ast: StrictASTNode;
  exec(string: string): TypedMatchArray<P> | null;
  test(string: string): boolean;
}

export function typedRegex<P extends string>(pattern: P, flags: string = ""): TypedRegex<P> {
  const ast = parseStrict(pattern);
  const nativeRegex = new RegExp(pattern, flags);

  return {
    pattern,
    flags,
    ast,
    exec(string: string) {
      const result = nativeRegex.exec(string);
      if (!result) return null;
      return result as unknown as TypedMatchArray<P>;
    },
    test(string: string) {
      return nativeRegex.test(string);
    },
  };
}
