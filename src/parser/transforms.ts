/** Quick function just to evaluate if a value can be considered as number or not */
export function transformsNumber(value: string) {
  if (isNaN(value as any)) return value;
  else return Number(value);
}

/**
 * Transforms a string to a JavaScript value
 */
export function transforms(value: string) {
  // Check that is not a number neither a JSON object
  if (isNaN(value as any)) {
    if (value === "false" || value === "FALSE") return false;
    else if (value === "true" || value === "TRUE") return true;
    else if (value === "null" || value === "NULL") return null;
    else return value;
  } else return Number(value);
}
