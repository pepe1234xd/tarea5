import { NotAllowedValueError } from "./errors";
import { isValueObject } from "./is-value-object";
import { Spreadsheet } from "./spreadsheet/spreadsheet";
import { format } from "./text-format";
import { ValueData } from "./types";

/**
 * Transforms a data object into a string using the set format
 * @param object The data to be stringified to CSV format
 * @returns A string with the CSV format
 */
export function stringify(object: ValueData<any> | Spreadsheet<any>) {
  let string = "";
  const data = object instanceof Spreadsheet ? object.toArray() : object;
  for (let y = 0; y < data.length; y++) {
    const column = data[y];
    for (let x = 0; x < column.length; x++) {
      const element = column[x];
      if (!isValueObject(element)) throw NotAllowedValueError;
      string += `${format.quote}${String(element)}${format.quote}`;
      if (x < column.length - 1) string += format.delimiter;
    }
    if (y < data.length - 1) string += format.brk;
  }
  return string;
}
