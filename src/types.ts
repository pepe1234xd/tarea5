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

/** Parsing context information used to trigger certain events */
export type ParseContext = {
  /** Global index, indicating where in the string is the parsing process */
  index: number;
  /** Gets the real string length in case the text did not have an end character string */
  slength: number;
  /** A line to be processed as a row */
  line: string;
  /** Determines if the value was in quote mode (If the text existed between quote symbols) */
  isQuoted: boolean;
  /** Start index reference for the error function */
  startIndex: number;
  /** Index reference for the error function */
  errorIndex: number;
  /** Global pointer for the iteration process */
  pointer: Coordinates;
  /** The final sum of flags to determine if the parsed values should be transformed */
  shouldTransform: boolean;
  /**
   * During the reducer process if the strictMode and transform options are set
   * if a line starts and ends with "{}" or "[]", will be marked as a JSON object
   */
  isJSON: boolean;
  /** Resets the values from the context */
  reset(): void;
};
