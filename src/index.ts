import type { InferRegExp, TypedMatchArray } from "./types.js";

export interface TypedRegExp<P extends string> extends Omit<RegExp, "exec"> {
  exec(string: string): TypedMatchArray<P> | null;
}

export function typedRegex<P extends string>(
  pattern: [InferRegExp<P>] extends [never] ? never : P,
  flags?: string,
): TypedRegExp<P> {
  return new RegExp(pattern, flags) as TypedRegExp<P>;
}
