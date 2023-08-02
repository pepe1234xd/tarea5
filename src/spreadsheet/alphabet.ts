import { NotValidBase26String } from "../errors";

const offset = "A".charCodeAt(0);
const base = "Z".charCodeAt(0) - offset + 1;

/** Object that helps to create columns like strings based on the alphabet  */
export const alphabet = {
  /** Transforms to code applying the corresponding offset some character*/
  code(char: string) {
    const code = char.charCodeAt(0) - offset;
    // Ensures a number is in base 26, and throws an error if it is not part of it
    if (code < 0 || code > base) throw NotValidBase26String;
    else return code;
  },
  /** Transforms a number into a alphabet representation */
  fromNumber(number: number) {
    /** Will contain each new generated code */
    let string = "";
    /** Will contain the residual from the division result */
    let r = 0;
    /** Will contain the division result as an integer */
    let d = number;
    // Repeats process untill all characters are processed
    while (d > 0) {
      // Getting the remainder when divided by the base
      r = (d - 1) % base;
      // Getting the division with no remainder
      d = (d - r - 1) / base;
      // Concat string
      string = String.fromCharCode(r + offset) + string;
    }
    // Return the generated string
    return string;
  },
  getNumber(string: string) {
    /** The generated number */
    let number = 0;
    // Avoid issues because capital letter was passed
    string = string.toUpperCase();
    // The process will be going in reverse to go from the smaller
    // to the bigger exponent index
    for (let i = string.length - 1; i >= 0; i--) {
      number +=
        (this.code(string[i]) + 1) * Math.pow(base, string.length - 1 - i);
    }
    // Returning all the summed values
    return number;
  },
};
