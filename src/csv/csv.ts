import {
  IsNotTableFormatError,
  NotValidOptionError,
  NotValidHeaderError,
} from "../validations.js";
import type { CellObject, Coordinates, Size } from "../types.js";
import { Cursor } from "./cursor.js";
import { Pointer } from "./pointer.js";

type InsertOptions = {
  /** Determines what to be inserted */
  inserts?: typeof ROW_LINE | typeof COLUMN_LINE;
  /** The place to move the cursor to take the expand action (will move the internal cursor) */
  cursor?: Cursor;
  /** The value that will be inserted if passed: in the cursor place if passed if no in the new initial position */
  word?: CellObject;
  /** If set will insert the new column or row after where the cursor is */
  after?: boolean;
};

type DeleteOptions = {
  /** Determines what to be deleted */
  deletes?: typeof ROW_LINE | typeof COLUMN_LINE;
  /** The place to move the cursor to take the expand action (will move the internal cursor) */
  cursor?: Cursor;
  /** If set will delete the new column or row after where the cursor is */
  after?: boolean;
};

// Enums to determine what to insert
export const ROW_LINE = "ROW_LINE";
export const COLUMN_LINE = "COLUMN_LINE";

/** A CSV parsed object */
export class CSV {
  /** The string that was converted to a CSV object */
  string: string;
  /**
   * Returns if this object is a table or not
   */
  isTable: boolean = false;
  /** Internal cursor */
  #cursor: Cursor = new Cursor({
    row: 1,
    column: 1,
  });

  /**
   * Returns a copy from the internal cursor
   */
  public get cursor() {
    return this.#cursor.clone();
  }

  /** Returns true if the data set was empty */
  isEmpty: boolean = true;
  /**
   * If contains headers, will be stored here as an array
   * if not the array will be empty
   */
  headers: string[] = [];
  /**
   * Passed from "Options" shows if the current CSV file
   * has headers
   */
  hasHeaders: boolean = false;
  /**
   * The real data from the CSV, stored as a table like object
   * where any data can be accessed as 'x' and 'y'
   * coordinates
   *
   * @example
   * const table = "'a','b','c'";
   * const c = table[0][2];
   */
  data: CellObject[][] = [[null]];

  /**
   * @param string The string where the CSV object comes from
   */
  constructor(string: string) {
    this.string = string;
  }

  /**
   * If table mode is on, will describe the table size
   * @emits IsNotTableFormatError if the object is not in table format
   */
  getSize(): Size {
    if (!this.isTable) throw IsNotTableFormatError;
    return {
      columns: this.data.length + 1,
      rows: this.data[0].length + 1,
    };
  }

  /**
   * Moves the cursor to a specified position (if set) then reads the data table content
   * @param cursor The place to point to the data, if no cursor was passed will use the last value from the internal cursor
   */
  read<T extends CellObject>(cursor?: Partial<Cursor>): T {
    // If no cursor is set will default to zero
    if (cursor) {
      if (!cursor.row) cursor.row = this.#cursor.row;
      if (!cursor.column) cursor.column = this.#cursor.column;
      this.#cursor = cursor as Cursor;
    }
    let x: number = this.#cursor.row - 1;
    let y: number = this.#cursor.column - 1;
    return this.data[y][x] as T;
  }

  /**
   * Moves the cursor to the selected position but not reads it
   */
  select(cursor: Cursor) {
    this.#cursor = cursor;
  }

  /**
   * Creates a new row, and if a value is passed will be set as the first element
   * @param word The line to be added
   * @remarks Highly efficient if you only want to insert a new row
   */
  push(word?: CellObject) {
    const size = this.getSize();
    // Get the new last row position
    const y = size.rows;
    // Moves the cursor to the new row
    this.#cursor.go({ row: y + 1 });
    // If the table mode is on, will fill with empty values
    if (this.isTable) {
      // Create an empty row with a new size
      let row = Array(size.columns + 1);
      for (let i = 0; i < row.length; i++) {
        row[i] = null;
      }
      this.data.push(row);
    }
    // Will just insert the new row
    else {
      // Creates a new row and inserts the data
      this.data.push([]);
    }
    // If a value was passed, store it in the new position
    if (word !== undefined) this.data[y][0] = word;
  }

  /**
   * Adds a new value to the end of the row
   * @param word The line to be added
   * @param cursor The place to where add the new value (if not passed will use the internal cursor)
   * @remarks This method will always remove the table mode
   */
  stick(word: string, cursor?: Cursor) {
    if (this.hasHeaders) {
      if (typeof word === "string") this.headers.push(word);
      else throw NotValidHeaderError;
    } else {
      if (cursor) this.#cursor = cursor;
      this.#cursor.move({ row: 1 });
      let pointer = this.#cursor.toPointer();
      this.data[pointer.y].push(word);
    }
    this.isTable = false;
  }

  /**
   * If table mode is on, inserts a new row or column
   * @emits IsNotTableFormatError if the object is not in table format
   */
  insert(options?: InsertOptions) {
    let inserts = options?.inserts ? options.inserts : ROW_LINE;
    let after = options?.after !== true ? options?.after : true;
    let word = options?.word;

    // Gets the current size
    const size = this.getSize();
    // Points to the new last position
    let pointer = new Cursor({
      row: size.rows + 1,
      column: size.columns + 1,
    }).toPointer();

    // If a row will be inserted before the desired position,
    // move the cursor minus one place as the splice function
    // always inserts after the passsed index

    switch (inserts) {
      case ROW_LINE:
        /** New row to be inserted */
        let row = new Array(size.columns);
        // Creates a new array filled of empty values
        for (let i = 0; i <= size.columns - 1; i++) {
          row[i] = null;
        }
        // If a cursor was passed move the pointer to such position
        // then insert the new row
        if (options?.cursor) {
          pointer.go(options.cursor.toPointer());
          if (after !== true) pointer.move({ y: -1 });
          // If a value was passed will be placed at the selected position of the cursor
          if (word) row[pointer.x] = word;
          // Inserts the new row
          this.data.splice(pointer.y, 0, row);
        }
        // If no cursor was passed inserts the new row in the last position
        else {
          if (after !== true) pointer.move({ y: -1 });
          // If a value was passed will be placed at the beggining of the new row
          if (word) row[0] = word;
          // If the row will be inserted after, just push a new array in the set
          if (after) {
            this.data.push(row);
          }
          // Otherwise a row will be inserted between the final and the prefinal row
          else {
            this.data.splice(pointer.y, 0, row);
          }
        }
        break;
      case COLUMN_LINE:
        // As the column only exists "virtually" is needed to iterate over
        // the main array and splice each individual subarray to the desired position

        /** New row to be inserted */
        let column = new Array(size.rows);
        // Creates a new array filled of empty values
        for (let i = 0; i <= size.rows - 1; i++) {
          column[i] = null;
        }
        // If a cursor was passed move the pointer to such position
        // then insert the new column
        if (options?.cursor) {
          pointer.go(options.cursor.toPointer());
          if (after !== true) pointer.move({ x: -1 });
          // If a value was passed will be placed at the selected position of the cursor
          if (word) column[pointer.y] = word;
          // Passes the values from the new column
          for (let i = 0; i < size.rows - 1; i++) {
            this.data[i].splice(pointer.x, 0, column[i]);
          }
        }
        // Inserts the new column relative to the end of the rows
        else {
          if (after !== true) pointer.move({ x: -1 });
          // If a value was passed will be placed at the beggining of the new column
          if (word) column[0] = word;
          // If the column will be inserted after, just push the corresponding value in the set
          if (after) {
            for (let i = 0; i < size.rows - 1; i++) {
              this.data[i].push(column[i]);
            }
          }
          // Otherwise the column values will be inserted between the final and the prefinal column
          else {
            for (let i = 0; i < size.rows - 1; i++) {
              this.data[i].splice(pointer.x, 0, column[i]);
            }
          }
        }
        break;
      default:
        throw NotValidOptionError;
    }

    // Finally updates the cursor to the last insertion position
    this.#cursor.go(pointer.toCursor());
  }

  /**
   * Updates a value in the selected cursor
   * @param word The value to put
   * @param cursor An optional cursor to select where to update (If none is passed the internal cursor will be used)
   */
  update(word: CellObject, cursor?: Cursor) {
    if (cursor) this.#cursor.go(cursor);
    const { x, y } = this.#cursor.toPointer().coordinates;
    this.data[y][x] = word;
  }

  /**
   * Updates a value in the selected cursor
   * @param cursor deletes
   */
  delete(options?: DeleteOptions) {
    // Create a pointer based on the current cursor
    let pointer = new Pointer(this.#cursor.toPointer());
    // If exists move the pointer to the desired place
    if (options?.cursor) pointer.go(options.cursor.toPointer());
    // Select what to delete
    let deletes = options?.deletes ? options.deletes : ROW_LINE;
    // Ensure after is at least by default true
    let after = options?.after !== true ? options?.after : true;
    // If the deletion should appear before remove one to
    // the index that is trying to be deleted
    switch (deletes) {
      case ROW_LINE:
        if (after !== true) pointer.move({ y: -1 });
        this.data.splice(pointer.y, 1);
        break;
      case COLUMN_LINE:
        if (after !== true) pointer.move({ x: -1 });
        this.data.splice(pointer.x, 1);
        break;
      default:
        throw NotValidOptionError;
    }
    // Move cursor to new position
    this.#cursor = pointer.toCursor();
  }

  /** Creates a deep clone from this object */
  clone() {
    let clone = new CSV(this.string);
    clone.isTable = this.isTable;
    clone.isEmpty = this.isEmpty;
    clone.data = JSON.parse(JSON.stringify(this.data));
    if (this.hasHeaders) {
      clone.headers = JSON.parse(JSON.stringify(this.headers));
      clone.hasHeaders = true;
    }
    return clone;
  }
}
