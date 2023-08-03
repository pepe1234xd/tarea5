export type TextFormat = {
  /** The quote separator */
  quote?: '"' | string;
  /** The delimiter between objects */
  delimiter?: "," | "|" | string;
  /** The breaker between rows */
  brk?: "\r\n" | "\r" | string;
  /** If set, all memoization logic will be used otherwise will be ignored */
  memoize?: boolean;
  /** Use in case your string has a final break (i.e. The on added at the end of a document) */
  hasHeaders?: boolean;
  /** If set an open quoted value that was never closed will be rejected */
  strictMode?: boolean;
  /** Empty lines (No content between two breakers) will be ignored */
  ignoreEmptyLines?: boolean;
  /** Use in case your string contains the end character */
  hasEndCharacter?: boolean;
  /**
   * Only if the strict mode is activated, parses the following texts
   * as JavaScript values if they are not quoted:
   * - numbers
   * - true, false, TRUE, FALSE
   * - null, NULL
   * - undefined, UNDEFINED
   * - JSON Objects
   */
  transform?: boolean;
  /**
   * The empty value to place when a empty cell is found during parsing
   * @default empty = ""
   */
  empty?: ValueEmpty;
};

export type Props = {
  startIndex: number;
  errorIndex: number;
  index: number;
  slength: number;
  isTable: boolean;
};

/**
 * A row, column position
 */
export type Position = {
  row: number;
  column: number | string;
};

/**
 * A x, y coordintates
 */
export type Pointer = {
  x: number;
  y: number;
};

export type LineLimit = "@bottom" | "@right";
export type RangeLimit =
  | "@left-top"
  | "@left-bottom"
  | "@right-bottom"
  | "@right-top";
export type CellSelector = number | string | LineLimit;
export type RangeSelector =
  | RangeLimit
  | {
      row: CellSelector;
      column: CellSelector;
    };

export type Size = {
  rows: number;
  columns: number;
};

export type DefineValueEmpty<E extends ValueEmpty | undefined> =
  E extends undefined ? "" : E;
/** Reprecents a cell value that is empty */
export type ValueEmpty = "" | 0 | null;
/** Represents the types that a cell from the CSV object may contain */
export type ValueObject = string | number | boolean | object | ValueEmpty;
/** Represents the CSV content */
export type ValueData<O extends ValueObject> = O[][];
/** The unique format from the spreadsheet */
export type SpreadhseetFormat = {
  /** The word quotes */
  quote: string;
  /** The line delimiter */
  delimiter: string;
  /** The line breaker */
  brk: string;
};
/** Represents the Spreadsheet Data */
export interface SpreadsheetContent {
  /** The string that was converted to a CSV object */
  readonly string: string;
  /**
   * Returns if this object is a table or not
   */
  readonly isTable: boolean;
  /**
   * If contains headers, will be stored here as an array
   * if not the array will be empty
   */
  readonly headers: string[];
  /**
   * Passed from "Options" shows if the current CSV file
   * has headers
   */
  readonly hasHeaders: boolean;
  /**
   * If table mode is on, will describe the table size
   * @emits IsNotTableFormatError if the object is not in table format
   */
  readonly size: Size;
}

/**
 * The insert options for the spreadsheet
 */
export type SpreadhseetInsertOptions = {
  /** The row to start writing the content (If not passed will be evaluated as 1) */
  start: CellSelector;
  /**  If passed the data will be inserted after the desired row */
  after: boolean;
};
