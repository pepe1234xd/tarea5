import { format } from "../text-format.js";
import { ValueEmpty } from "../types.js";

/**
 * The processed value will be saved then "x" will update the value (plus one)
 * each time a delimiter is found in the string.
 * The pointer is meant to reset to "{x:0,y:y++}" each time a breaker is added
 * to point to the new row that will be added.
 */
class ContextPointer {
  /** X is stable state if it's value is the same at every skip */
  isStableX: boolean = true;
  /** The previous larges "x" reached before every skip */
  lastLargestX: number = 0;
  /** X coordintate */
  x: number = 0;
  /** Y coordintate */
  y: number = 0;

  /**
   * Moves to the right the pointer "x++"
   */
  right() {
    this.x++;
  }

  /**
   * Moves to the start of the next current row "{x:0,y:y++}"
   */
  skip() {
    // Saves the last largest x before reset and checks if the x is stable
    // at every new skip
    if (this.y > 0 && this.isStableX)
      this.isStableX = this.lastLargestX === this.x;
    this.lastLargestX = this.x;
    this.x = 0;
    this.y++;
  }
}

/** Parsing context information used to trigger certain events */
export class ParseContext {
  /** The string to be working on */
  string: string;
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
  pointer: ContextPointer;
  /** The final sum of flags to determine if the parsed values should be transformed */
  shouldTransform: boolean;
  /**
   * During the reducer process if the strictMode and transform options are set
   * if a line starts and ends with "{}" or "[]", will be marked as a JSON object
   */
  isJSON: boolean;
  /**
   * On reducer saves only once the regex instance to find double quotes
   * on process
   */
  quoteRegex: RegExp;

  /** @param string The string to be parsed as a CSV object */
  constructor(string: string) {
    this.string = string;
    /** Real string length in case that has no end character the string */
    this.slength = format.hasEndCharacter ? string.length - 1 : string.length;
    this.index = 0;
    this.startIndex = 0;
    this.errorIndex = 0;
    this.isQuoted = false;
    this.line = "";
    this.isJSON = false;
    this.shouldTransform = false;
    this.quoteRegex = new RegExp(format.quote, "gum");
    this.pointer = new ContextPointer();
  }

  /** Resets the regex to be used for the process function */
  resetQuoteRegex() {
    this.quoteRegex.lastIndex = 0;
  }

  /** Resets the values from the context */
  reset() {
    this.string = "";
    this.index = 0;
    this.startIndex = 0;
    this.errorIndex = 0;
    this.isQuoted = false;
    this.line = "";
    this.isJSON = false;
    this.shouldTransform = false;
    this.quoteRegex.lastIndex = 0;
    this.pointer = new ContextPointer();
  }
}

let _context: ParseContext = {} as any;

/**
 * Creates and starts the parse context for all kind of
 * references needed during all the process
 * @param string The string to be parsed as a CSV object
 */
export function createContext(string: string) {
  _context = new ParseContext(string);
}

/** Global parse context */
export const context = new Proxy(_context, {
  get(target, prop, receiver) {
    return (_context as any)[prop];
  },
  set(target, prop, value, receiver) {
    (_context as any)[prop] = value;
    return true;
  },
});
