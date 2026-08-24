type Join<T extends unknown[]> = T extends []
  ? ""
  : T extends [infer H, ...infer R]
    ? H extends string
      ? R extends unknown[]
        ? `${H}${Join<R>}`
        : string
      : H extends undefined
        ? R extends []
          ? undefined
          : string
        : string
    : string;

type PushArr<T extends unknown[], V> = [...T, V];

type ApplyQuantifierArr<T extends unknown[], Q extends string> = T extends [...infer H, infer L]
  ? Q extends "*"
    ? [...H, L | undefined]
    : Q extends "+"
      ? [...H, L]
      : Q extends "?"
        ? [...H, L | undefined]
        : T
  : T;

type ParseCharClass<S extends string> = S extends `]${infer Rest}`
  ? [string, Rest]
  : S extends `\\${infer _C}${infer Rest}`
    ? ParseCharClass<Rest>
    : S extends `${infer _C}${infer Rest}`
      ? ParseCharClass<Rest>
      : never;

type StackItem = {
  arr: unknown[];
  named: Record<string, unknown>;
};

type PushStack<S extends StackItem, V> = {
  arr: PushArr<S["arr"], V>;
  named: S["named"];
};

type LastStack<S extends StackItem[]> = S extends [...infer _, infer L extends StackItem]
  ? L
  : never;

type SetLastStack<S extends StackItem[], V extends StackItem> = S extends [
  ...infer H extends StackItem[],
  infer _L extends StackItem,
]
  ? [...H, V]
  : S;

export type InferRegExp<
  S extends string,
  Stack extends StackItem[] = [{ arr: []; named: {} }],
> = S extends ""
  ? { arr: Stack[0]["arr"]; named: Stack[0]["named"] }
  : S extends `(?<${infer Name}>${infer Rest}`
    ? InferRegExp<
        Rest,
        [
          ...Stack,
          {
            arr: [];
            named: { [K in Name]: string | undefined };
          },
        ]
      >
    : S extends `(?:${infer Rest}`
      ? InferRegExp<Rest, [...Stack, { arr: []; named: {} }]>
      : S extends `(?<=${infer Rest}`
        ? InferRegExp<Rest, Stack>
        : S extends `(?<!${infer Rest}`
          ? InferRegExp<Rest, Stack>
          : S extends `(?=${infer Rest}`
            ? InferRegExp<Rest, Stack>
            : S extends `(?!${infer Rest}`
              ? InferRegExp<Rest, Stack>
              : S extends `(${infer Rest}`
                ? InferRegExp<Rest, [...Stack, { arr: []; named: {} }]>
                : S extends `)${infer Rest}`
                  ? Stack extends [
                      ...infer Init extends StackItem[],
                      infer Parent extends StackItem,
                      infer Current extends StackItem,
                    ]
                    ? InferRegExp<
                        Rest,
                        [
                          ...Init,
                          {
                            arr: [...Parent["arr"], Join<Current["arr"]>];
                            named: Parent["named"] & Current["named"];
                          },
                        ]
                      >
                    : never
                  : S extends `\\d${infer Rest}`
                    ? InferRegExp<Rest, SetLastStack<Stack, PushStack<LastStack<Stack>, string>>>
                    : S extends `\\w${infer Rest}`
                      ? InferRegExp<Rest, SetLastStack<Stack, PushStack<LastStack<Stack>, string>>>
                      : S extends `\\s${infer Rest}`
                        ? InferRegExp<
                            Rest,
                            SetLastStack<Stack, PushStack<LastStack<Stack>, string>>
                          >
                        : S extends `\\.${infer Rest}`
                          ? InferRegExp<
                              Rest,
                              SetLastStack<Stack, PushStack<LastStack<Stack>, string>>
                            >
                          : S extends `\\p{${infer _P}}${infer Rest}`
                            ? InferRegExp<
                                Rest,
                                SetLastStack<Stack, PushStack<LastStack<Stack>, string>>
                              >
                            : S extends `\\${infer C}${infer Rest}`
                              ? InferRegExp<
                                  Rest,
                                  SetLastStack<Stack, PushStack<LastStack<Stack>, C>>
                                >
                              : S extends `[${infer Rest}`
                                ? ParseCharClass<Rest> extends [
                                    infer V,
                                    infer NextRest extends string,
                                  ]
                                  ? InferRegExp<
                                      NextRest,
                                      SetLastStack<Stack, PushStack<LastStack<Stack>, V>>
                                    >
                                  : never
                                : S extends `*${infer Rest}`
                                  ? InferRegExp<
                                      Rest,
                                      SetLastStack<
                                        Stack,
                                        {
                                          arr: ApplyQuantifierArr<LastStack<Stack>["arr"], "*">;
                                          named: LastStack<Stack>["named"];
                                        }
                                      >
                                    >
                                  : S extends `+${infer Rest}`
                                    ? InferRegExp<
                                        Rest,
                                        SetLastStack<
                                          Stack,
                                          {
                                            arr: ApplyQuantifierArr<LastStack<Stack>["arr"], "+">;
                                            named: LastStack<Stack>["named"];
                                          }
                                        >
                                      >
                                    : S extends `?${infer Rest}`
                                      ? InferRegExp<
                                          Rest,
                                          SetLastStack<
                                            Stack,
                                            {
                                              arr: ApplyQuantifierArr<LastStack<Stack>["arr"], "?">;
                                              named: LastStack<Stack>["named"];
                                            }
                                          >
                                        >
                                      : S extends `{${infer _N},${infer _M}}${infer Rest}`
                                        ? InferRegExp<Rest, Stack>
                                        : S extends `{${infer _N}}${infer Rest}`
                                          ? InferRegExp<Rest, Stack>
                                          : S extends `|${infer Rest}`
                                            ? InferRegExp<Rest, Stack>
                                            : S extends `${infer C}${infer Rest}`
                                              ? InferRegExp<
                                                  Rest,
                                                  SetLastStack<
                                                    Stack,
                                                    PushStack<LastStack<Stack>, C>
                                                  >
                                                >
                                              : never;

export type TypedMatchArray<P extends string> =
  InferRegExp<P> extends {
    arr: infer A extends unknown[];
    named: infer N;
  }
    ? [string, ...A] & { groups: N }
    : never;
