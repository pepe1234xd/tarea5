import { Size, ValueData } from "../types";
import { Spreadsheet } from "./spreadsheet";

const _toEqualsSize = (s1: Size, s2: Size) => {
  return s1.columns === s2.columns && s1.rows === s2.rows;
};

function _toEqualsData(d1: ValueData<any>, d2: ValueData<any>) {
  // Checks if two values are different
  const isDifferent = (v1: any, v2: any) =>
    JSON.stringify(v1) !== JSON.stringify(v2);

  // Iterates through all the object to checl if some value differ with the original
  for (let y = 0; y < d2.length; y++) {
    const column1 = d2[y];
    const column2 = d1[y];
    // Checks that both are arrays
    if (column1.length === undefined || column2.length === undefined)
      return false;
    for (let x = 0; x < column1.length; x++) {
      if (isDifferent(column1[x], column2[x])) return false;
    }
  }
  // If nothing differs then return true
  return true;
}

/**
 * Compares CSV objects to check if they are equals
 */
export function toEquals(this: Spreadsheet<any>, object: Spreadsheet<any>) {
  if (this.hasHeaders && object.hasHeaders) {
    if (!_toEqualsData([this.headers], [object.headers])) return false;
  } else return false;

  return (
    this.isTable === object.isTable &&
    this.isEmpty === object.isEmpty &&
    this.hasHeaders === object.hasHeaders &&
    this.isEmpty === object.isEmpty &&
    _toEqualsSize(this.size, object.size) &&
    _toEqualsData(this.data, object.data)
  );
}
