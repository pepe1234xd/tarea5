import { setTextFormat, format, setDefaultTextFormat } from "./text-format.js";
import { parse } from "./parser/parse.js";
import { TextFormat, ValueObject } from "./types.js";

/**
 * @module
 * This class handles CSV format text files, either to parse or read them
 */
export class XSV {
  constructor() {
    // Populates the global text format with a default format
    setDefaultTextFormat();
  }

  /**
   * Parses a string into a Spreadsheet object
   * @param string The CSV string that will be converted to an object
   */
  toSpreadsheet<V extends ValueObject>(string: string) {
    return parse<V>(string);
  }

  /** Gets a copy from the current text format */
  public get format(): TextFormat {
    return structuredClone(format);
  }

  /** Sets the text format to be used while parsing */
  public set format(v: TextFormat) {
    setTextFormat(v);
  }
}

const xsv = new XSV();
export default xsv;
