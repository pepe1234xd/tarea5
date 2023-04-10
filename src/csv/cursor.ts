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
      this.column = position.column;
    }
  }

  /**
   * @param position The new position for the pointer
   */
  go(position: Partial<Position>) {
    if (position.row) this.row = position.row;
    if (position.column) this.column = position.column;
    return this;
  }

  /**
   * @param position Adds the passed position to the cursor
   */
  move(position: Partial<Position>) {
    if (position.row) this.row += position.row;
    if (position.column) this.column += position.column;
    return this;
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
   * Transforms the position onto a pointer
   */
  toPointer() {
    return new Pointer({
      x: this.column - 1,
      y: this.row - 1,
    });
  }
}
