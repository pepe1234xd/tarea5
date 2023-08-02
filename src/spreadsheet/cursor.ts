import { alphabet } from "./alphabet.js";
import { Position } from "../types.js";
import { Pointer } from "./pointer.js";

/**
 * A number, or a string containing a number.
 */
export class Cursor implements Position {
  row: number = 1;
  column: number = 1;

  /**
   * Returns the current cursor position
   */
  public get position(): Position {
    return {
      row: this.row,
      column: this.column,
    };
  }

  /**
   * @param position The start coordinates from the pointer
   */
  constructor(position?: Position) {
    if (position) {
      this.row = position.row;
      this.column =
        typeof position.column === "string"
          ? alphabet.getNumber(position.column)
          : position.column;
    }
  }

  /**
   * Clones this object and creates a new copy
   */
  clone() {
    return new Cursor({
      row: this.row,
      column: this.column,
    });
  }

  /**
   * Transforms the position into a pointer
   */
  toPointer() {
    return new Pointer({
      x: this.column - 1,
      y: this.row - 1,
    });
  }

  /**
   * Transforms the position into a grid:
   * - Columns will be passed alphabetically
   * - If available headers will be used instead of the alphabet
   * - Rows will be passed as numbers
   */
  toGrid() {
    return new Pointer({
      x: this.column - 1,
      y: this.row - 1,
    });
  }
}
