import { type } from "os";
import {
  CellSelector,
  Pointer,
  RangeSelector,
  SpreadsheetContent,
  TextFormat,
  ValueData,
} from "../src/types";

export type TestCaseUnit<I, X> = {
  _id: string;
  skip: boolean;
  expected: X;
  message: string;
  format?: TextFormat;
} & I;

export type ErrorCaseUnit = {
  _id: string;
  skip: boolean;
  message: string;
  name: string;
  throws: string;
  format?: TextFormat;
  /** The parameters to pass to the function to cause the error */
  params: any[];
};

type GeneralTest<I, X> = {
  _id: string;
  skip: boolean;
  items: TestCaseUnit<I, X>[];
  errors?: ErrorCaseUnit[];
};

// Parse Tests

type Transforms = GeneralTest<
  {
    _id: string;
    string: string;
  },
  string | null | undefined | number
>;

type Process = GeneralTest<
  {
    _id: string;
    word: string;
    isQuoted: boolean;
    isJSON: boolean;
  },
  any
>;

type Parse = GeneralTest<
  {
    string: string;
  },
  SpreadsheetContent & { data: ValueData<any> }
>;

// Alphabet Tests

type FromNumber = GeneralTest<
  {
    number: number;
  },
  string
>;

type GetNumber = GeneralTest<
  {
    string: string;
  },
  number
>;

// Spreadhseet Tests

type WriteContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    selector: {
      row: CellSelector;
      column: CellSelector;
    };
    writtable: string;
  },
  string
>;

type RangeContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    to: RangeSelector;
    from: RangeSelector;
  },
  ValueData<any>
>;

type BulkContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    selector: {
      row: CellSelector;
      column: CellSelector;
    };
    writtable: ValueData<any>;
  },
  string
>;

type ReadContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    selector: {
      row: CellSelector;
      column: CellSelector;
    };
  },
  string
>;

// Source

type IsValueObject = GeneralTest<
  {
    value: any;
  },
  boolean
>;

type Stringify = GeneralTest<
  {
    object: ValueData<any>;
  },
  string
>;

/// TEST CASES

export type TestAlphabet = "from-number" | "get-number";
export type TestParser = "transforms" | "process" | "parse";
export type TestSpreadsheet = "write" | "read" | "range" | "bulk";
export type TestSource = "stringify" | "is-value-object";

export type TestName = TestAlphabet | TestParser | TestSpreadsheet | TestSource;

// Validations to check mock files
export const isAlphaetTest = (value: string): value is TestAlphabet =>
  value === "from-number" || value === "get-number";
export const isParserTest = (value: string): value is TestParser =>
  value === "transforms" || value === "process" || value === "parse";
export const isSpreadsheetTest = (value: string): value is TestSpreadsheet =>
  value === "write" ||
  value === "read" ||
  value === "bulk" ||
  value === "range";
export const isSourceTest = (value: string): value is TestSource =>
  value === "stringify" || value === "is-value-object";

export type Test<T extends TestName> = T extends "transforms"
  ? Transforms
  : T extends "process"
  ? Process
  : T extends "parse"
  ? Parse
  : T extends "from-number"
  ? FromNumber
  : T extends "get-number"
  ? GetNumber
  : T extends "write"
  ? WriteContent
  : T extends "bulk"
  ? BulkContent
  : T extends "read"
  ? ReadContent
  : T extends "range"
  ? RangeContent
  : T extends "stringify"
  ? Stringify
  : T extends "is-value-object"
  ? IsValueObject
  : never;

type UnArray<T> = T extends Array<infer U> ? U : T;
export type Callback<T extends TestName> = (
  this: Mocha.Context,
  item: Omit<UnArray<Test<T>["items"]>, "_id" | "message" | "skip">,
  done: (err?: Error) => void,
) => boolean | void;

export type Thrower = (this: any, ...args: any) => any;

export type Callee<T extends TestName> = {
  key: T;
  cb: Callback<T>;
  th: Thrower;
};

export type Spies = { [T in TestName]: Test<T> };
