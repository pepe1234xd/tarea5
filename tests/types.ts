type GeneralTest<T, E> = {
  _id: string;
  skip: boolean;
  items: Array<
    {
      skip: boolean;
      expected: E;
      message: string;
    } & T
  >;
};

type Transforms = GeneralTest<
  {
    _id: string;
    string: string;
  },
  string | null | undefined | number
>;

type Before = GeneralTest<
  {
    _id: string;
    value: string;
  },
  string
>;

type Between = GeneralTest<
  {
    _id: string;
    before: string;
    after: string;
    round: boolean;
  },
  string
>;

type Diverge = GeneralTest<
  {
    _id: string;
    before: string;
    after: string;
  },
  string
>;

type Criteria = GeneralTest<
  {
    _id: string;
    value: string;
    before: string;
    after: string;
  },
  boolean
>;

type OnThreshold = GeneralTest<
  {
    _id: string;
    before: string;
    next: string;
    trigger: string;
  },
  boolean
>;

type OnOverflow = GeneralTest<
  {
    _id: string;
    before: string;
    next: string;
    trigger: string;
  },
  boolean
>;

type Core = GeneralTest<
  {
    _id: string;
    before: string;
    after: string;
  },
  string
>;

type Previous = GeneralTest<
  {
    _id: string;
    value: string;
  },
  string
>;

type Next = GeneralTest<
  {
    _id: string;
    value: string;
  },
  string
>;

type ToObject = GeneralTest<
  {
    _id: string;
    value: string;
  },
  object
>;

type ToString = GeneralTest<
  {
    _id: string;
    value: {
      n: string;
      z: string;
    };
  },
  string
>;

type ToEquals = GeneralTest<
  {
    _id: string;
    value: {
      n: string;
      z: string;
    };
    equals: string;
  },
  boolean
>;

type ValueOf = GeneralTest<
  {
    _id: string;
    before: string;
    after: string;
    greater: boolean;
  },
  boolean
>;

type Update = GeneralTest<
  {
    _id: string;
    original: string;
    update: string;
  },
  string
>;

type IsPosition = GeneralTest<
  {
    _id: string;
    value: {
      n: string;
      z: string;
    };
  },
  boolean
>;

type IsPositionObject = GeneralTest<
  {
    _id: string;
    value: {
      n: string;
      z: string;
    };
  },
  boolean
>;

export type TestParser = "transforms" | "parse";
export type TestCSV = "insert" | "update";

export type TestName = TestParser | TestCSV;
export const isParserTest = (value: string): value is TestParser =>
  value === "transforms" || value === "parse";
export const isCSVTest = (value: string): value is TestCSV =>
  value === "insert" || value === "update";

export type Test<T extends TestName> = T extends "transforms"
  ? Transforms
  : T extends "before"
  ? Before
  : T extends "between"
  ? Between
  : T extends "diverge"
  ? Diverge
  : T extends "criteria"
  ? Criteria
  : T extends "onThreshold"
  ? OnThreshold
  : T extends "onOverflow"
  ? OnOverflow
  : T extends "core"
  ? Core
  : T extends "previous"
  ? Previous
  : T extends "next"
  ? Next
  : T extends "toObject"
  ? ToObject
  : T extends "toString"
  ? ToString
  : T extends "toEquals"
  ? ToEquals
  : T extends "valueOf"
  ? ValueOf
  : T extends "update"
  ? Update
  : T extends "isPosition"
  ? IsPosition
  : T extends "isPositionObject"
  ? IsPositionObject
  : never;

type UnArray<T> = T extends Array<infer U> ? U : T;
export type Callback<T extends TestName> = (
  this: Mocha.Context,
  item: Omit<UnArray<Test<T>["items"]>, "_id" | "message" | "skip">,
  done: (err?: Error) => void,
) => boolean | void;

export type Spies = { [T in TestName]: Test<T> };
