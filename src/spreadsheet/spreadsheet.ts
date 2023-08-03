import { alphabet } from "./alphabet.js";
import {
  IsNotTableFormatError,
  isNotTableError,
  FoundUndefinedElementError,
  NotFoundColumnError,
  InvalidRangeSelector,
  NotAllowedElementToSaveError,
  NotFoundRowError,
  NotValidLineLimitError,
  NotValidRangeLimitError,
} from "../errors.js";
import type {
  ValueObject,
  CellSelector,
  ValueEmpty,
  LineLimit,
  Size,
  RangeSelector,
  RangeLimit,
  Pointer,
  SpreadsheetContent,
  ValueData,
  SpreadhseetFormat,
} from "../types.js";
import { format } from "../text-format.js";

/** Checks if some string can be considered as a limit */
function toCellPosition(dimension: Pointer, s: string | number) {
  switch (s) {
    case "@bottom":
      return dimension.y;
    case "@right":
      return dimension.x;
    default:
      if (typeof s === "string") {
        return alphabet.getNumber(s) - 1;
      } else {
        return s - 1;
      }
  }
}

/** Checks if some string can be considered as a limit */
function toRangePointer(dimension: Pointer, s: RangeSelector) {
  switch (s) {
    case "@left-bottom":
      return {
        x: 0,
        y: dimension.y,
      };
    case "@left-top":
      return {
        x: 0,
        y: 0,
      };
    case "@right-bottom":
      return {
        x: dimension.x,
        y: dimension.y,
      };
    case "@right-top":
      return {
        x: dimension.x,
        y: 0,
      };
    default:
      return {
        x: toCellPosition(dimension, s.row),
        y: toCellPosition(dimension, s.column),
      };
  }
}

const _getDimension = (data: any[][]): Pointer => {
  return {
    x: data.length - 1,
    y: data[0].length - 1,
  };
};

const JSON_PROTOTYPE = Object.getPrototypeOf({});

/** The Spreadsheet parsed object */
export class Spreadsheet<V extends ValueObject> implements SpreadsheetContent {
  /** Tracks a data change */
  #changed: boolean = false;

  // Spreadsheet will be marked as table until proven wrong
  #isTable: boolean;
  get isTable() {
    return this.#isTable;
  }
  #headers: string[];
  get headers() {
    return this.#headers;
  }
  #hasHeaders: boolean;
  get hasHeaders() {
    return this.#hasHeaders;
  }
  #data: ValueData<V>;

  get size(): Size {
    if (!this.#isTable) throw IsNotTableFormatError;
    return {
      rows: this.#data.length,
      columns: this.#data[0].length,
    };
  }

  #quote: string = "";
  #delimiter: string = "";
  #brk: string = "";
  #string: string = "";
  get string(): string {
    return this.#stringify();
  }

  /**
   * @param clone The string where the CSV object comes from
   *
   */
  constructor(
    data: ValueData<V>,
    isTable: boolean,
    headers: string[],
    hasHeaders: boolean,
    { brk, delimiter, quote }: SpreadhseetFormat,
    clone?: string,
  ) {
    this.#data = data;

    this.#isTable = isTable;
    this.#headers = headers;
    this.#hasHeaders = hasHeaders;
    this.#data = data;

    this.#quote = quote;
    this.#delimiter = delimiter;
    this.#brk = brk;
    if (clone !== undefined) {
      this.#string = clone;
    } else {
      this.#stringify();
    }
  }

  #stringify() {
    let string = "";
    for (let y = 0; y < this.#data.length; y++) {
      const column = this.#data[y];
      for (let x = 0; x < column.length; x++) {
        const element = column[x];
        string += `${this.#quote}${String(element)}${this.#quote}`;
        if (x < column.length - 1) string += this.#delimiter;
      }
      if (y < this.#data.length - 1) string += this.#brk;
    }
    this.#string = string;
    return string;
  }

  /**
   * Checks if the passed value is a valid ValueObject that only contains:
   * - Text
   * - Booleans
   * - Numbers
   * - Objects or Arrays containing the previous ones
   */
  isValueObject(value: any): value is ValueObject {
    if (value === null) return true;
    const type = typeof value;
    if (
      type === "string" ||
      type === "number" ||
      type === "bigint" ||
      type === "boolean"
    ) {
      return true;
    } else if (
      type === "function" ||
      type === "symbol" ||
      type === "undefined"
    ) {
      return false;
    } else {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const isValid = this.isValueObject(value[i]);
          if (!isValid) return false;
        }
      } else {
        if (Object.getPrototypeOf(value) === JSON_PROTOTYPE) {
          let entries = Object.entries(value);
          for (let i = 0; i < entries.length; i++) {
            const isValid = this.isValueObject(entries[i][1]);
            if (!isValid) return false;
          }
        } else return false;
      }
      return true;
    }
  }

  /**
   * Moves the cursor to a specified position (if set) then reads the data table content
   * @param cursor The place to point to the data, if no cursor was passed will use the last value from the internal cursor
   */
  read<T extends V>(row: CellSelector, column: CellSelector) {
    if (!this.isTable)
      throw isNotTableError("Read specific value within the table");
    const dimension = _getDimension(this.#data);

    // Validate the first array exists
    let y = toCellPosition(dimension, column);
    if (this.#data.length < y) return undefined;

    // Validate the second array exists
    let x = toCellPosition(dimension, row);
    if (this.#data[y].length < x) return undefined;

    return this.#data[y][x] as T;
  }

  /**
   * Writes a value to a specific cell
   * @param value The value to be writtten
   * @param row The row to select
   * @param column The column to select
   */
  write(value: V, row: CellSelector, column: CellSelector) {
    if (!this.isTable)
      throw isNotTableError("Write specific value within the table");
    if (!this.isValueObject(value)) throw NotAllowedElementToSaveError;
    this.#changed = true;
    const dimension = _getDimension(this.#data);

    // Validate the first array exists
    const y = toCellPosition(dimension, column);
    if (dimension.y < y) throw NotFoundColumnError(y);
    const x = toCellPosition(dimension, row);
    if (dimension.x < x) throw NotFoundRowError(x);

    this.#data[y][x] = value;
  }

  /**
   * Writes a set of values to a specific range
   * @param value The value to be written (Must be a table or the out of boundaries values will be ignored)
   * @param start The point to start writing the content (If not passed will be evaluated as 0, 0)
   */
  bulk<T extends V>(values: ValueData<T>, start: RangeSelector) {
    if (!this.isTable)
      throw isNotTableError("Write specific ranges within the table");
    this.#changed = true;
    const dimension = _getDimension(this.#data);
    const s = toRangePointer(dimension, start);
    const v = {
      x: s.x + values.length - 1,
      y: s.y + values.length - 1,
    };

    // Ignore values boyond the data scope
    if (dimension.y < v.y) v.y = dimension.y;
    if (dimension.x < v.x) v.x = dimension.x;

    for (let y = s.y; y <= v.y; y++) {
      const column = values[y - s.y];
      for (let x = s.x; x <= v.x; x++) {
        const value = column[x - s.x];
        // Validate the value exists
        if (!this.isValueObject(value)) throw NotAllowedElementToSaveError;
        this.#data[y][x] = value;
      }
    }
  }

  /**
   * Reads a range of contents from the CSV object
   * @param from The first point to start selecting the content
   * @param to The final point to stop selecting the content
   */
  range<T extends V>(from: RangeSelector, to: RangeSelector): ValueData<T> {
    if (!this.#isTable) throw isNotTableError("Read sets within the table");

    const dimension = _getDimension(this.#data);
    const p1 = toRangePointer(dimension, from);
    const p2 = toRangePointer(dimension, to);

    const range: ValueData<any> = [];
    for (let y = p1.y; y <= p2.y; y++) {
      const column: V[] = [];
      if (dimension.y < y) throw NotFoundColumnError(y);
      for (let x = p1.x; x <= p2.x; x++) {
        column.push(this.#data[y][x]);
        if (dimension.x < x) throw NotFoundRowError(x);
      }
      range.push(column);
    }

    return range as ValueData<T>;
  }

  /**
   * When the default function "valueOf" is called will return the data
   */
  valueOf() {
    if (!this.#changed) return this.#string;
    else return this.#stringify();
  }

  /**
   * The real data from the CSV, stored as a table like object
   * where any data can be accessed as 'x' and 'y'
   * coordinates
   *
   * @example
   * const table = "'a','b','c'";
   * const c = table[0][2];
   */
  toArray() {
    return structuredClone(this.#data);
  }

  /**
   * Returns the data set as a string
   */
  toString() {
    if (!this.#changed) return this.#string;
    else return this.#stringify();
  }

  /** Creates a deep clone from this object */
  clone() {
    const data = structuredClone(this.#data);
    const headers = this.hasHeaders ? structuredClone(this.#headers) : [];
    return new Spreadsheet<V>(
      data,
      this.#isTable,
      headers,
      this.#hasHeaders,
      {
        quote: this.#quote,
        delimiter: this.#delimiter,
        brk: this.#brk,
      },
      this.#string,
    );
  }
}
