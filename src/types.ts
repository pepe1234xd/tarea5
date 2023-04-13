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
  /** The special symbol to be used as the representation for "empty" values */
  empty?: Symbol;
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
  column: number;
};
/**
 * A x, y coordintates
 */
export type Coordinates = {
  x: number;
  y: number;
};

export type Size = {
  rows: number;
  columns: number;
};

/** Represents the types that a cell from the CSV object may contain */
export type CellObject =
  | string
  | number
  | boolean
  | null
  | undefined
  | object
  | Symbol;
