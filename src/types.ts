type Prettify<T> = { [K in keyof T]: T[K] } & {};

type Frame = {
  self: [string] | [];
  selfNamed: Record<string, unknown>;
  arr: unknown[];
  named: Record<string, unknown>;
  alt: boolean;
};

type NewFrame<Self extends [string] | [] = [], Named extends Record<string, unknown> = {}> = {
  self: Self;
  selfNamed: Named;
  arr: [];
  named: {};
  alt: false;
};

type Opt<T, B extends boolean> = {
  [K in keyof T]: B extends true ? T[K] | undefined : T[K];
};

type CloseGroup<
  Parent extends Frame,
  Child extends Frame,
  SelfOpt extends boolean,
  InnerOpt extends boolean = SelfOpt extends true ? true : Child["alt"],
> = {
  self: Parent["self"];
  selfNamed: Parent["selfNamed"];
  arr: [...Parent["arr"], ...Opt<Child["self"], SelfOpt>, ...Opt<Child["arr"], InnerOpt>];
  named: Parent["named"] & Opt<Child["selfNamed"], SelfOpt> & Opt<Child["named"], InnerOpt>;
  alt: Parent["alt"];
};

type MarkAlt<S extends Frame[]> = S extends [...infer Init extends Frame[], infer Top extends Frame]
  ? [
      ...Init,
      {
        self: Top["self"];
        selfNamed: Top["selfNamed"];
        arr: Top["arr"];
        named: Top["named"];
        alt: true;
      },
    ]
  : never;

type SkipClass<S extends string> = S extends `\\${infer _}${infer Rest}`
  ? SkipClass<Rest>
  : S extends `]${infer Rest}`
    ? Rest
    : S extends `${infer _}${infer Rest}`
      ? SkipClass<Rest>
      : never;

type IsOptionalAfter<S extends string> = S extends `?${string}` | `*${string}` | `{0,${string}`
  ? true
  : false;

export type InferRegExp<S extends string, Stack extends Frame[] = [NewFrame]> = S extends ""
  ? Stack extends [infer Root extends Frame]
    ? {
        arr: Opt<Root["arr"], Root["alt"]>;
        named: Prettify<Opt<Root["named"], Root["alt"]>>;
      }
    : never
  : S extends `\\${infer _}${infer Rest}`
    ? InferRegExp<Rest, Stack>
    : S extends `[${infer Rest}`
      ? SkipClass<Rest> extends infer Next extends string
        ? [Next] extends [never]
          ? never
          : InferRegExp<Next, Stack>
        : never
      : S extends `|${infer Rest}`
        ? InferRegExp<Rest, MarkAlt<Stack>>
        : S extends
              | `(?:${infer Rest}`
              | `(?=${infer Rest}`
              | `(?!${infer Rest}`
              | `(?<=${infer Rest}`
              | `(?<!${infer Rest}`
          ? InferRegExp<Rest, [...Stack, NewFrame]>
          : S extends `(?<${infer Name}>${infer Rest}`
            ? Name extends "" | `${string})${string}`
              ? never
              : InferRegExp<Rest, [...Stack, NewFrame<[string], Record<Name, string>>]>
            : S extends `(?<${string}`
              ? never
              : S extends `(${infer Rest}`
                ? InferRegExp<Rest, [...Stack, NewFrame<[string]>]>
                : S extends `)${infer Rest}`
                  ? Stack extends [
                      ...infer Init extends Frame[],
                      infer Parent extends Frame,
                      infer Child extends Frame,
                    ]
                    ? InferRegExp<Rest, [...Init, CloseGroup<Parent, Child, IsOptionalAfter<Rest>>]>
                    : never
                  : S extends `${infer _}${infer Rest}`
                    ? InferRegExp<Rest, Stack>
                    : never;

export type TypedMatchArray<P extends string> =
  InferRegExp<P> extends {
    arr: infer A extends unknown[];
    named: infer N;
  }
    ? Omit<RegExpExecArray, "groups"> & [string, ...A] & { groups: N }
    : never;
